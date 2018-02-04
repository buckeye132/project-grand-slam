class GrandSlamGame {
  constructor(targetElement) {
    this.physicsEngine = Phaser.Physics.ARCADE;
    this.controllers = [];
    this.playerCharacter = null;
    this.enemyCharacters = [];

    this.eventBus = new EventBus();

    this.spriteManager = new SpriteManager("assets/config/sprite_config.json", this);
    this.weaponManager = new WeaponManager(["assets/config/weapon_config.json"], this);
    this.enemyManager = new EnemyManager(["assets/config/enemy_config.json"], this);
    this.mapManager = new MapManager("assets/config/map_config.json", this);
    this.levelManager = new LevelManager("assets/config/test_level.json", this);

    this.hud = new HUD("assets/config/hud_config.json", this);

    this.phaserGame = null; // set by main.js
  }

  /* PHASER GAME STATES */
  preload() {
    this.spriteManager.preload();
    this.weaponManager.preload();
    this.enemyManager.preload();
    this.mapManager.preload();
  }

  create() {
    // game setup
    this.phaserGame.time.advancedTiming = true;
    this.phaserGame.input.mouse.capture = true;
    this.phaserGame.canvas.oncontextmenu = function (e) { e.preventDefault(); };

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
    var enemyControllers = this.levelManager.createEnemies();
    for (var enemyController of enemyControllers) {
      this.controllers.push(enemyController);
    }

    // HUD
    this.hud.createHud();
  }

  update() {
    // update all controllers
    var destroyedControllers = [];
    for (var controller of this.controllers) {
      controller.update();

      if (controller.isDestroyed) {
        console.log("found destroyed controller.");
        destroyedControllers.push(controller);
      }
    }

    // discard distroyed controllers and characters
    for (var destroyedController of destroyedControllers) {
      var controllerIndex = this.controllers.indexOf(destroyedController);
      this.controllers.splice(controllerIndex, 1);

      if (this.playerCharacter == destroyedController.character) {
        console.log("Player destroyed.");
        delete this.playerCharacter;
        this.playerCharacter = null;
      }
    }

    this.hud.update();
  }

  render() {
    this.phaserGame.debug.text(this.phaserGame.time.fps || '--', 2, 14, "#FF0000");
  }

  /* Private Helper Functions */
  setCameraFollow(targetSprite) {
    this.phaserGame.camera.follow(targetSprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    console.log("camera bounds: " + this.phaserGame.camera.bounds)
  }
}
