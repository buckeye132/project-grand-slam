ENEMY_CONFIG_LOCATION = "assets/config/enemy_config.json";
PLAYER_CONFIG_LOCATION = "assets/config/player_config.json";

class CharacterManager {
  constructor(game, enableRendering) {
    this.game = game;
    this.enableRendering = enableRendering;

    // lazy load config
    this.enemyConfig = null;
    this.playerConfig = null;

    this.characters = new Map();

    // create an object to aggregate status updates from clients
    this.characterStatusAggregate = {};
  }

  /* Event Handlers */
  handleCharacterStatus(data) {
    // if we're on the server
    if (this.isServer) {
      // depending where the event is coming from, data is structured a bit differently
      var statusData = data.data;
      var characterId = data.playerId;
      if (!data) {
        statusData = data;
        characterId = data.id;
      }

      // aggregate this into the collective character status
      this.characterStatusAggregate[characterId] = statusData;
    }
  }

  handlePlayerLeave(data) {
    // if we're on the server
    if (this.isServer) {
      // remove the player's character from our character map
      if(this.characters.has(data.playerId)) {
        this.characters.get(data.playerId).destroy();
        this.characters.delete(data.playerId);
      }

      // remove character status from aggregate
      delete this.characterStatusAggregate[data.playerId];
    }
  }

  handleSpawnPlayerRequest(data) {
    // if we're the server
    if (this.isServer) {
      console.log("Request to spawn player: " + JSON.stringify(data));

      // load player build configs if needed
      if (!this.playerConfig) {
        this.playerConfig = this.game.factory.JSONConfigLoader.LoadJson(
          PLAYER_CONFIG_LOCATION, this.game.factory.fs).playerBuilds;
      }

      // grab requested build from config
      var buildName = data.data.build;
      var buildConfig = this.playerConfig[buildName];
      if (!buildConfig) {
        console.error("Unknown player build requested: " + buildName);
      }

      // grab next available spawn position
      var spawnPos = this.game.levelManager.getNextPlayerSpawnPosition();

      // instruct the client to spawn the player character
      this.game.eventServer.emit(data.playerId, "spawn_player",
        {buildConfig: buildConfig, spawnPosition: spawnPos});
    }
  }

  handlePlayerStatusBroadcast(data) {
    // if we're on the client
    if (this.isClient) {
      // check for new characters that we don't know about
      for (var playerId in data) {
        if (!this.characters.has(playerId)) {
          console.log("Found previously unknown character: " + JSON.stringify(data[playerId]));
          var newCharacter = new this.game.factory.Character(this.game,
            data[playerId].characterConfig, playerId, this.isClient, true);
          this.characters.set(playerId, newCharacter);
        }
      }
    }
  }

  handleSpawnLocalPlayer(data) {
    // if we're on the client
    if (this.isClient) {
      console.log("Spawning player from data: " + JSON.stringify(data));

      // create a character and controller for the player character
      var playerCharacter = new this.game.factory.PlayerCharacterController(
        data.spawnPosition.x, data.spawnPosition.y, data.buildConfig, this.game);
      this.characters.set(this.game.playerId, playerCharacter);
    }
  }

  /* Public Interface */
  spawnLocalEnemies(enemyList) {
    // enemies should only spawn on the server
    if (this.isServer) {
      // load enemy config
      if (!this.enemyConfig) {
        this.enemyConfig = JSONConfigLoader.LoadJson(ENEMY_CONFIG_LOCATION).enemyTypes;
      }

      // spawn the requested enemies
      for (var enemyData of enemyList) {
        var config = this.enemyConfig[enemyData.type];
        if (!config) {
          console.error("Tried to spawn unknown enemy type: ", enemyData.type);
          continue;
        }

        // generate a guid for this new character
        var newCharacterId = uuid();

        // create the character object
        // TODO - move this into the enemy character controller
        var newCharacter = new this.game.factory.Character(this.game,
          config.characterConfig, newCharacterId, false, true);
        this.characters.set(newCharacterId, newCharacter);
      }
    }
  }

  requestSpawnPlayer() {
    // send a request to spawn the player character
    this.game.eventBus.publishNetwork("spawn_player_request",
      {build: "default"});
  }

  enableEvents() {
    if (this.isServer) { // server
      // create an object to aggregate status updates from clients
      this.characterStatusAggregate = {};

      // register event listeners
      this.game.eventServer.subscribe("character_status",
        this.handleCharacterStatus, this);
      this.game.eventBus.subscribe("character_status",
        this.handleCharacterStatus, this);
      this.game.eventServer.subscribePlayerLeave(this.handlePlayerLeave, this);
      this.game.eventServer.subscribe("spawn_player_request",
        this.handleSpawnPlayerRequest, this);
    } else { // client
      // register event listeners
      this.game.eventBus.subscribeNetwork("character_status_broadcast",
        this.handlePlayerStatusBroadcast, this);
      this.game.eventBus.subscribeNetwork("spawn_player",
        this.handleSpawnLocalPlayer, this);
    }
  }

  update() {
    var charactersToRemove = [];

    for (var characterId of this.characters.keys()) {
      var character = this.characters.get(characterId);

      // check for characters that have been destroyed
      if (character.isDestroyed) {
        charactersToRemove.push(newCharacterId);
      } else {
        // call update on all managed characters
        character.update();
      }
    }

    // remove destroyed characters
    for (var characterId of charactersToRemove) {
      this.characters.delete(characterId);
    }

    // if we're the server
    if (this.isServer) {
      // broadcast last known status of all characters if it's time
      this.game.eventServer.broadcast("character_status_broadcast",
        this.characterStatusAggregate);
    }
  }

  /* Helpers */
  get isServer() {
    return !this.enableRendering;
  }

  get isClient() {
    return this.enableRendering;
  }
}

if (typeof window === 'undefined') {
  module.exports = CharacterManager;
}