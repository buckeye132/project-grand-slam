class PlayerBuildManager {
  constructor(configFilePaths, game) {
    this.game = game;
    this.playerBuildMap = new Map();

    for (var configFilePath of configFilePaths) {
      var config = game.factory.JSONConfigLoader.LoadJson(configFilePath,
        game.factory.fs);

      for (var buildConfig of config.playerBuilds) {
        this.playerBuildMap.set(buildConfig.name, buildConfig);
      }
    }
  }

  createPlayer(x, y, buildName, playerId) {
    var buildConfig = this.playerBuildMap.get(buildName);
    if (!buildConfig) {
      console.error("Tried to player with build that isn't defined: ", buildName);
      return null;
    }

    return new this.game.factory.PlayerCharacterController(x, y, buildConfig,
      this.game, playerId);
  }
}
