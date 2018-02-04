class HUDStatusBar {
  constructor(game, hud, config) {
    this.game = game;
    this.hud = hud;
    this.config = config;

    this.screenPosition = null

    this.graphics = null;
    this.sprite = null;

    this.value = 1.0;
  }

  create(group) {
    this.screenPosition = this.hud.calculateAbsolutePosition(this.config.position);
    console.log("screen position: " + this.screenPosition.x + " " + this.screenPosition.y);

    this.graphics = this.game.phaserGame.add.graphics(0, 0);
    this.sprite = phaserGame.add.sprite(0, 0);
    this.sprite.addChild(this.graphics);
    group.add(this.sprite);

    if (this.config.source.type == "event_bus") {
      this.game.eventBus.subscribe(this.config.source.eventName,
        this.sourceUpdateHandler, this);
    } else {
      console.error("Unrecognized source type: " + this.config.source.type);
    }
  }

  update() {
    this.draw();
  }

  draw() {
    this.graphics.lineStyle(2, HUD.ParseColorString(this.config.color.border), 1);

    // empty
    this.graphics.beginFill(HUD.ParseColorString(this.config.color.empty));
    this.graphics.drawRect(this.screenPosition.x, this.screenPosition.y,
      this.config.size.width, this.config.size.height);

    // fill
    this.graphics.beginFill(HUD.ParseColorString(this.config.color.filled));
    if (this.config.orientation == "vertical") {
      this.graphics.drawRect(this.screenPosition.x,
        this.screenPosition.y + ((1 - this.value) * this.config.size.height),
        this.config.size.width,
        this.config.size.height * this.value);
    } else {
      this.graphics.drawRect(this.screenPosition.x,
        this.screenPosition.y,
        this.config.size.width * this.value,
        this.config.size.height);
    }
  }

  sourceUpdateHandler(data) {
    if (data[this.config.source.dataField]) {
      this.value = data[this.config.source.dataField];
    }
  }
}
