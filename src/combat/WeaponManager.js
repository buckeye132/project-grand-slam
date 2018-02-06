class WeaponManager {
  constructor(configFilePaths, game) {
    this.game = game;
    this.weaponConfigMap = new Map();

    for (var configFilePath of configFilePaths) {
      var config = JSONConfigLoader.LoadJson(configFilePath);

      for (var weaponConfig of config.weapons) {
        this.weaponConfigMap.set(weaponConfig.name, weaponConfig);
      }
    }
  }

  createWeapon(name) {
    var weaponConfig = this.weaponConfigMap.get(name);
    if (!weaponConfig) {
      console.error("Tried to create weapon that isn't defined: ", name);
      return null;
    }

    return new Weapon(this.game, weaponConfig);
  }

}
