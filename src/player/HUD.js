class HUD {
  constructor(configFilePath, game) {
    this.game = game;

    this.config = JSONConfigLoader.LoadJson(configFilePath);
    this.elements = [];

    for (var elementConfig of this.config.hudElements) {
      if (elementConfig.type == "status_bar") {
        this.elements.push(new HUDStatusBar(this.game, this, elementConfig));
      } else if(elementConfig.type == "label") {
        this.elements.push(new HUDLabel(this.game, this, elementConfig));
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

  calculateAbsolutePosition(relativePosition, size) {
    return {
      x: HUD.AdjustRelativeValue(relativePosition.x, this.game.phaserGame.width, size.width),
      y: HUD.AdjustRelativeValue(relativePosition.y, this.game.phaserGame.height, size.height)
    };
  }

  static AdjustRelativeValue(position, windowSize, objectSize) {
    var result = 0;

    if (typeof position === "string" || position instanceof String) {
      if (position === "centered") {
        result = (windowSize - objectSize) / 2;
      } else {
        console.error("Unrecognized position keyword: " + position);
      }
    } else {
      if (position < 0) {
        result = windowSize + position;
      } else {
        result = position;
      }
    }

    return result;
  }

  static ParseColorString(colorString) {
    return parseInt(colorString, 16);
  }
}
