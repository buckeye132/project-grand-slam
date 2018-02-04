class MapManager {
  constructor(mapConfigPath, game) {
    this.game = game;
    this.config = JSONConfigLoader.LoadJson(mapConfigPath);

    this.preloadedMaps = new Map();
    this.tilemaps = new Map();
  }

  preload() {
    for (var mapConfig of this.config.maps) {
      this.game.phaserGame.load.tilemap(
        mapConfig.name,
        mapConfig.assetPath,
        null,
        Phaser.Tilemap.TILED_JSON);

      for (var tilesetConfig of mapConfig.tilesets) {
        this.game.phaserGame.load.image(
          tilesetConfig.name,
          tilesetConfig.assetPath);
      }

      this.preloadedMaps.set(mapConfig.name, mapConfig);
    }
  }

  createMapLayer(name, layerIndex) {
    var mapConfig = this.preloadedMaps.get(name);
    if (!mapConfig) {
      console.error("Tried to create map that isn't preloaded: ", name);
      return null;
    }

    var tilemap = this.tilemaps.get(name);
    if (!tilemap) {
      tilemap = this.game.phaserGame.add.tilemap(mapConfig.name);
      for (var tilesetConfig of mapConfig.tilesets) {
        tilemap.addTilesetImage(tilesetConfig.name, tilesetConfig.name);
      }

      this.tilemaps.set(name, tilemap);
    }

    return tilemap.createLayer(mapConfig.layers[layerIndex]);
  }
}
