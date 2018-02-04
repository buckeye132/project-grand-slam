class HUD {
  constructor(configFilePath, game) {
    this.game = game;

    this.config = JSONConfigLoader.LoadJson(configFilePath);
    this.elements = [];

    for (var elementConfig of this.config.hudElements) {
      if (elementConfig.type == "status_bar") {
        this.elements.push(new HUDStatusBar(this.game, this, elementConfig));
      } else {
        console.log("Unrecognized element type: " + elementConfig.type);
      }
    }
  }

  preload() {

  }

  update() {
    this.game.phaserGame.world.bringToTop(this.group);

    for (var element of this.elements) {
      element.update();
    }
  }

  createHud() {
    this.group = this.game.phaserGame.add.group();
    this.group.fixedToCamera = true;

    for (var element of this.elements) {
      element.create(this.group);
    }
  }

  calculateAbsolutePosition(relativePosition) {
    var absolutePosition = Object.assign({}, relativePosition);

    console.log("game size: " + this.game.phaserGame.width + " " + this.game.phaserGame.height);

    if (absolutePosition.x < 0) {
      absolutePosition.x = this.game.phaserGame.width + absolutePosition.x;
    }
    if (absolutePosition.y < 0) {
      absolutePosition.y = this.game.phaserGame.height + absolutePosition.y;
    }

    return absolutePosition;
  }

  static ParseColorString(colorString) {
    return parseInt(colorString, 16);
  }
}
