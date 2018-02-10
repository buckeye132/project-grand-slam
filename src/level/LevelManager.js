class LevelManager {
  constructor(levelConfigPath, game) {
    this.config = game.factory.JSONConfigLoader.LoadJson(
      levelConfigPath, game.factory.fs);
    this.game = game;

    this.nextPlayerSpawnIndex = 0;
  }

  transformRelativePosition(relativePosition) {
    // position can be negative to indicate relative inset from bottom or right of world
    //  we need to transform these into absolute positions
    var position = Object.assign({}, relativePosition);
    if (position.x < 0) {
      position.x = this.config.level.worldSize.width + position.x;
    }
    if (position.y < 0) {
      position.y = this.config.level.worldSize.height + position.y;
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


      var enemy = this.game.enemyManager.createEnemy(enemyConfig.type,
        position.x, position.y);
      enemies.push(enemy);
    }

    return enemies;
  }
}

if (typeof window === 'undefined') {
  module.exports = LevelManager;
}
