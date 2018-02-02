class GrandSlamGame {
  constructor(targetElement) {
    this.physicsEngine = Phaser.Physics.ARCADE;
    this.controllers = [];
    this.playerCharacter = null;
    this.enemyCharacters = [];

    this.phaserGame = null; // set by main.js
  }

  /* PHASER GAME STATES */
  preload() {

  }

  create() {
    // game setup
    this.phaserGame.input.mouse.capture = true;
    this.phaserGame.canvas.oncontextmenu = function (e) { e.preventDefault(); };

    // player character
    this.playerCharacter = new Character(100, 100, this, 0x00FF00);
    this.controllers.push(new KeyboardCharacterController(
      this.playerCharacter, this));

    // enemy characters
    this.createEnemy(0, 0, this.playerCharacter);
    this.createEnemy(500, 500, this.playerCharacter);
  }

  update() {
    // update all controllers
    for (var controller of this.controllers) {
      controller.update();
    }
  }

  render() {

  }

  /* Helper Functions */
  createEnemy(x, y, target) {
    var enemy = new Character(x, y, this, 0xFF0000, 50);
    enemy.target = target;
    enemy.clickCallback = this.reportEnemyClicked.bind(this);
    this.enemyCharacters.push(enemy);
    this.controllers.push(new EnemyAiCharacterController(enemy, this, 80));
  }

  reportEnemyClicked(clickedEnemy) {
    for (var enemy of this.enemyCharacters) {
      if (clickedEnemy != enemy) {
        enemy.isHighlighted = false;
      }
    }
    clickedEnemy.isHighlighted = true;
    this.playerCharacter.target = clickedEnemy;
  }

  unhighlightAllEnemies() {
    for (var enemy of this.enemyCharacters) {
      enemy.isHighlighted = false;
    }
  }
}
