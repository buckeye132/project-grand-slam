var Game = window.Game || {};

(function(game) {
  var gsGame = new GrandSlamGame();
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
}(Game));
