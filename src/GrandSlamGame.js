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
    this.levelManager = new LevelManager("assets/levels/test_level.json", this);

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
    this.mapLayers = this.levelManager.createMapLayers(this.mapManager);

    // player character
    var playerSpawn = this.levelManager.getNextPlayerSpawnPosition();
    console.log("spawning player at " + playerSpawn.x, + " " + playerSpawn.y);
    this.playerCharacter = new Character(playerSpawn.x, playerSpawn.y, this, "char1");
    this.controllers.push(new PlayerCharacterController(
      this.playerCharacter, this));
    this.setCameraFollow(this.playerCharacter.sprite);

    // enemy characters
    this.enemyCharacters = this.levelManager.createEnemies();
    for (var enemyCharacter of this.enemyCharacters) {
      this.controllers.push(new EnemyCharacterController(enemyCharacter, this));
    }
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
  setCameraFollow(targetSprite) {
    this.phaserGame.camera.follow(targetSprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    console.log("camera bounds: " + this.phaserGame.camera.bounds)
  }
}
