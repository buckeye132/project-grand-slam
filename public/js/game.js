var Game = window.Game || {};

(function(game, utilities) {
  var splitPath = window.location.href.split("/");
  var gameId = splitPath[splitPath.length - 1];
  if (!utilities.isGameId(gameId)) {
    console.log("Invalid Game ID: " + gameId);
    window.location.replace('/');
  }
  console.log("Joined Game: " + gameId);

  var playerId = utilities.getCookie("playerIdentity");
  if (!playerId) {
    console.log("No existing player identity found.");
    window.location.replace('/?gameId=' + gameId);
  }
  console.log("Player ID: " + playerId);

  var gsGame = new GrandSlamGameClient(playerId, gameId);
  var gameState = {
    preload: function() {gsGame.preload()},
    create: function() {gsGame.create()},
    update: function() {gsGame.update()},
    render: function() {gsGame.render()},
  }
  var phaserGame = this.phaserGame = new Phaser.Game(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio,
    Phaser.AUTO,
    "game",
    gameState);
  gsGame.phaserGame = phaserGame;

}(Game, window.pgs.utilities));
