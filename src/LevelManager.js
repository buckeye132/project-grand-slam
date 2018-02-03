class LevelManager {
  constructor(levelConfigPath, game) {
    this.config = JSONConfigLoader.LoadJson(levelConfigPath);
    this.game = game;

    this.nextPlayerSpawnIndex = 0;
  }

  transformRelativePosition(relativePosition) {
    // position can be negative to indicate relative inset from bottom or right of world
    //  we need to transform these into absolute positions
    var position = relativePosition;
    if (position.x < 0) {
      position.x = this.game.phaserGame.world.width + position.x;
    }
    if (position.y < 0) {
      position.y = this.game.phaserGame.world.height + position.y;
    }

    return position;
  }

  createMapLayers(mapManager) {
    var mapLayers = [];
    for (var mapLayerConfig of this.config.level.mapLayers) {
      var mapLayer = mapManager.createMapLayer(
        mapLayerConfig.mapName,
        mapLayerConfig.layerIndex);

      if (mapLayerConfig.resizeWorld) mapLayer.resizeWorld();

      mapLayers.push(mapLayer);
    }

    return mapLayers;
  }

  getNextPlayerSpawnPosition() {
    var spawnIndex = this.nextPlayerSpawnIndex++;
    if (this.nextPlayerSpawnIndex >= this.config.level.playerSpawns.length) {
      this.nextPlayerSpawnIndex = 0;
    }

    return this.transformRelativePosition(this.config.level.playerSpawns[spawnIndex]);
  }

  createEnemies() {
    var enemies = [];
    for (var enemyConfig of this.config.level.enemies) {
      var position = this.transformRelativePosition(enemyConfig.position);

      var enemy = new Character(
        position.x,
        position.y,
        this.game,
        enemyConfig.type, // right now the type name just references a sprite name directly
        50);
      enemies.push(enemy);
    }

    return enemies;
  }
}
