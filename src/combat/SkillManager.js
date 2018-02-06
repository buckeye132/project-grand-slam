class SkillManager {
  constructor(configFilePaths, game) {
    this.game = game;
    this.skillConfigMap = new Map();

    for (var configFilePath of configFilePaths) {
      var config = JSONConfigLoader.LoadJson(configFilePath);

      for (var skillConfig of config.skills) {
        this.skillConfigMap.set(skillConfig.name, skillConfig);
      }
    }
  }

  createSkill(name) {
    var skillConfig = this.skillConfigMap.get(name);
    if (!skillConfig) {
      console.error("Tried to create skill that isn't defined: ", name);
      return null;
    }

    return new Skill(this.game, skillConfig);
  }

}
