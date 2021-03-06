class SpriteManager {
  constructor(spriteConfigPath, game) {
    this.config = JSONConfigLoader.LoadJson(spriteConfigPath);
    this.game = game;
    this.preloadedSprites = new Map();
  }

  preload() {
    for (var spriteConfig of this.config.sprites) {
      if (spriteConfig.type == "animated") {
        this.game.phaserGame.load.spritesheet(
          spriteConfig.name,
          spriteConfig.assetPath,
          spriteConfig.spriteSheetProperties.frameWidth,
          spriteConfig.spriteSheetProperties.frameHeight,
          spriteConfig.spriteSheetProperties.frameCount);

        this.preloadedSprites.set(spriteConfig.name, spriteConfig);
      } else if (spriteConfig.type == "sheet") {
        this.game.phaserGame.load.spritesheet(
          spriteConfig.name,
          spriteConfig.assetPath,
          spriteConfig.spriteSheetProperties.frameWidth,
          spriteConfig.spriteSheetProperties.frameHeight,
          spriteConfig.spriteSheetProperties.frameCount);

        this.preloadedSprites.set(spriteConfig.name, spriteConfig);
      } else {
        console.error("Unknown sprite type: " + spriteConfig.type);
      }
    }
  }

  createSprite(x, y, name) {
    var spriteConfig = this.preloadedSprites.get(name);
    if (!spriteConfig) {
      console.error("Tried to create sprite that isn't preloaded: ", name);
      return null;
    }

    var sprite = this.game.phaserGame.add.sprite(x, y, name);

    if (spriteConfig.type == "animated") {
      // add animations
      for (var animationConfig of spriteConfig.animations) {
        sprite.animations.add(animationConfig.name, animationConfig.frames,
          animationConfig.frameRate, animationConfig.loop);
      }
    }

    return sprite;
  }
}
