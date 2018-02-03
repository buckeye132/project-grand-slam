const GAME_WORLD_SIZE = {w: 1000, h: 2000};

class GrandSlamGame {
  constructor(targetElement) {
    this.physicsEngine = Phaser.Physics.ARCADE;
    this.controllers = [];
    this.playerCharacter = null;
    this.enemyCharacters = [];

    this.eventBus = new EventBus();

    this.spriteManager = new SpriteManager("assets/sprites/sprite_config.json", this);
    this.mapManager = new MapManager("assets/maps/map_config.json", this);

    this.phaserGame = null; // set by main.js
  }

  /* PHASER GAME STATES */
  preload() {
    this.spriteManager.preload();
    this.mapManager.preload();
  }

  create() {
    // game setup
    this.phaserGame.input.mouse.capture = true;
    this.phaserGame.canvas.oncontextmenu = function (e) { e.preventDefault(); };
    //this.phaserGame.world.setBounds(0, 0, GAME_WORLD_SIZE.w, GAME_WORLD_SIZE.h);

    // create map
    this.mapLayer = this.mapManager.createMapLayer("test_map", 0);
    this.mapLayer.resizeWorld();

    // player character
    this.playerCharacter = new Character(100, 100, this, "char1");
    this.controllers.push(new PlayerCharacterController(
      this.playerCharacter, this));
    this.setCameraFollow(this.playerCharacter.sprite);

    // enemy characters
    this.createEnemy(0, 0, "baddie1", this.playerCharacter);
    this.createEnemy(500, 500, "baddie2", this.playerCharacter);
  }

  update() {
    // update all controllers
    for (var controller of this.controllers) {
      controller.update();
    }
  }

  render() {

  }

  /* Private Helper Functions */
  createEnemy(x, y, spriteName, target) {
    var enemy = new Character(x, y, this, spriteName, 50);
    enemy.target = target;
    this.enemyCharacters.push(enemy);
    this.controllers.push(new EnemyCharacterController(enemy, this));
  }

  setCameraFollow(targetSprite) {
    this.phaserGame.camera.follow(targetSprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
  }
}
