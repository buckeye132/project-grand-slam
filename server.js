var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var uuid = require('uuid/v4');

/*
 * Express server
 */
app.get('/js/phaser.min.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/phaser/build/phaser.min.js')
});

// serve static content out of client directory
app.use('/', express.static(__dirname + '/public'));
app.use('/src', express.static(__dirname + '/src'));

// start listening, default port 2000
server.listen(process.env.PORT || 2000);
console.log("Server Started.");

/*
 * Game Server
 */
io.on('connection',function(socket) {
  socket.player = {
    id: uuid()
  };
  console.log("Player Joined: " + socket.player.id);

  socket.on('disconnect',function(){
    console.log("Player Left: " + socket.player.id);
  });

  socket.on('input', function(input) {
    console.log("Player " + socket.player.id + " : input - " + input);
  });
});
