class EnemyManager {
  constructor(configFilePaths, game) {
    this.game = game;
    this.enemyTypeConfigMap = new Map();

    for (var configFilePath of configFilePaths) {
      var config = JSONConfigLoader.LoadJson(configFilePath);

      for (var enemyTypeConfig of config.enemyTypes) {
        this.enemyTypeConfigMap.set(enemyTypeConfig.name, enemyTypeConfig);
      }
    }
  }

  preload() {

  }

  createEnemy(type, x, y) {
    var enemyTypeConfig = this.enemyTypeConfigMap.get(type);
    if (!enemyTypeConfig) {
      console.error("Tried to create enemy with type that isn't defined: ", type);
      return null;
    }

    return new EnemyCharacterController(x, y, enemyTypeConfig, this.game);
  }
}
