class GrandSlamGameClient {
  constructor(playerId, gameId) {
    this.gameId = gameId;
    this.playerId = playerId;

    this.factory = new ClientClassFactory();

    this.physicsEngine = Phaser.Physics.ARCADE;
    this.controllers = [];
    this.playerCharacter = null;
    this.enemyCharacters = [];
    this.remotePlayers = {};

    this.eventBus = new this.factory.EventBus(this, this.playerId);

    this.spriteManager = new this.factory.SpriteManager(
      "/assets/config/sprite_config.json", this);
    this.weaponManager = new this.factory.WeaponManager(
      ["/assets/config/weapon_config.json"], this);
    //this.enemyManager = new EnemyManager(["/assets/config/enemy_config.json"], this);
    this.mapManager = new this.factory.MapManager(
      "/assets/config/map_config.json", this);
    this.levelManager = new this.factory.LevelManager(
      "/assets/config/test_level.json", this);
    this.skillManager = new this.factory.SkillManager(
      ["/assets/config/skill_config.json"], this);
    //this.playerBuildManager = new PlayerBuildManager(["/assets/config/player_config.json"], this)

    this.characterManager = new this.factory.CharacterManager(this, true);
    //this.remotePlayerManager = new RemotePlayerManager(this, this.playerId);

    this.hud = new HUD("/assets/config/hud_config.json", this);

    this.phaserGame = null; // set by main.js
  }

  /* PHASER GAME STATES */
  preload() {
    this.spriteManager.preload();
    this.mapManager.preload();
  }

  create() {
    // game setup
    this.phaserGame.stage.disableVisibilityChange = true;
    this.phaserGame.time.advancedTiming = true;
    this.phaserGame.input.mouse.capture = true;
    this.phaserGame.canvas.oncontextmenu = function (e) { e.preventDefault(); };
    this.phaserGame.physics.startSystem(this.physicsEngine);

    // create map
    this.mapLayers = this.levelManager.createMapLayers(this.mapManager);

    // create HUD
    this.hud.createHud();

    // player character
    /*var playerSpawn = this.levelManager.getNextPlayerSpawnPosition();
    console.log("spawning player at " + playerSpawn.x, + " " + playerSpawn.y);
    var playerController = this.playerBuildManager.createPlayer(
      playerSpawn.x, playerSpawn.y, "default", this.playerId);
    this.playerCharacter = playerController.character;
    this.controllers.push(playerController);
    this.setCameraFollow(this.playerCharacter.sprite);*/

    // enemy characters
    /*var enemyControllers = this.levelManager.createEnemies();
    for (var enemyController of enemyControllers) {
      this.controllers.push(enemyController);
    }*/

    this.characterManager.enableEvents();
    this.characterManager.requestSpawnPlayer();
  }

  update() {
    // update all controllers
    /*var destroyedControllers = [];
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

    this.remotePlayerManager.update();*/

    this.characterManager.update();

    this.hud.update();
  }

  render() {
    this.phaserGame.debug.text(this.phaserGame.time.fps || '--', 2, 14, "#FF0000");
  }
}
