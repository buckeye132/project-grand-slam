var socket = io();
var utilities = window.pgs.utilities;

var playerId = null;

// check for existing gameId in the request parameters
//  this would indicate the client has been redirected from the game
var gameId = utilities.getParameterByName("gameId");

socket.on('welcome', function(data) {
  // check if we already have a player identity cookie
  playerId = utilities.getCookie("playerIdentity")
  if (!playerId) {
    // request a new player identity
    console.log("No existing identity, requesting a new one.");
    socket.emit('request_player_id', {});
  } else {
    if (gameId) joinOrStartGame(playerId, gameId);
  }
});

socket.on('assign_player_id', function(data) {
  console.log("Got new player identity: " + data.playerId);
  utilities.setCookie("playerIdentity", data.playerId);
  playerId = data.playerId;
  if (gameId) joinOrStartGame(playerId, gameId);
});

socket.on('game_id', function(data) {
  console.log("got game ID: " + data.gameId);
  window.location.replace('/game/' + data.gameId);
});

var startGameSubmit = function() {
  if(playerId) joinOrStartGame(playerId);
}

var joinGameSubmit = function() {
  if(playerId) {
    var gameIdValue = document.getElementById("joinGameTxt").value;
    if (utilities.isGameId(gameIdValue)) {
      gameId = gameIdValue;
    } else {
      alert("Invalid Game ID.");
    }

    if (gameId) joinOrStartGame(playerId, gameId);
  }
}

var joinOrStartGame = function(playerId, gameId) {
  if (gameId && utilities.isGameId(gameId)) {
    console.log("Attempting join game by ID: " + gameId);
    socket.emit('join_game', {playerId: playerId, gameId: gameId});
  } else {
    console.log("Starting new game.");
    socket.emit('start_game', {playerId: playerId});
  }
}
