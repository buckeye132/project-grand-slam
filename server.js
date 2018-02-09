const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const uuid = require('uuid/v4');

const GrandSlameGameServer = require('./src/GrandSlamGameServer');

/*
 * Express server
 */
app.get('/js/phaser.min.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/phaser/build/phaser.min.js')
});
app.get('/js/EventEmitter.min.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/wolfy87-eventemitter/EventEmitter.min.js')
});

// serve game sessions
app.get("/game/*", function(req, res) {
  res.sendFile(__dirname + '/public/game.html');
});

// serve static content out of client directory
app.use('/', express.static(__dirname + '/public'));
app.use('/src', express.static(__dirname + '/src'));
app.use('/assets', express.static(__dirname + '/assets'));

// start listening, default port 2000
server.listen(process.env.PORT || 2000);
console.log("Server Started.");

/*
 * Game Server
 */
var gameInstances = new Map();

io.on('connection',function(socket) {
  socket.emit('welcome', {});

  socket.on('request_player_id', function() {
    // generate a new uuid for the player
    socket.emit('assign_player_id', {playerId: uuid()});
  });

  socket.on('start_game', function(data) {
    // genera new game ID
    var newGameId = uuid();

    // start an instance of the game server
    var gameServerInstance = new GrandSlameGameServer(newGameId, io);
    gameInstances.set(newGameId, gameServerInstance);

    // tell client to go ahead and join
    socket.emit("game_id", {gameId: newGameId});
  });

  socket.on('join_game', function(data) {
    // check if an instance for this game exists
    var joinGameId = data.gameId;
    var gameServerInstance = gameInstances.get(joinGameId);

    // if it's not already running, start a new instance
    // TODO - make thread safe!
    if (!gameServerInstance) {
      gameServerInstance = new GrandSlameGameServer(newGameId, io);
      gameInstances.set(joinGameId, gameServerInstance);
    }

    // tell client to go ahead and join
    socket.emit("game_id", {gameId: data.gameId});
  });

  socket.on('disconnect',function(){
    console.log("Player Left");
  });
});

// periodically check for stale server instances
setInterval(function() {
  var expiredGames = [];
  gameInstances.forEach(function(serverInstance, gameId, map) {
    if (serverInstance.hasTimeoutExpired) {
      console.log("Found Expired Server Instance: " + gameId);
      expiredGames.push(gameId);
    }
  });
  for (var expiredGameId of expiredGames) {
    gameInstances.delete(expiredGameId);
  }
}, 1000);
