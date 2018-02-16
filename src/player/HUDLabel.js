class HUDLabel {
  constructor(game, hud, config) {
    this.sourceUpdateHandler = this.sourceUpdateHandler.bind(this);

    this.game = game;
    this.hud = hud;
    this.config = config;

    this.screenPosition = null

    this.graphics = null;
    this.textObject = null;

    this.value = "";
  }

  create(group) {
    var style = {
      font: this.config.font,
      fill: "#" + this.config.color,
      align: "center"
    };
    this.textObject = this.game.phaserGame.add.text(0, 0, "", style);

    group.add(this.textObject);

    if (this.config.source.type == "event_bus") {
      this.game.eventBus.subscribe(this.config.source.eventName,
        this.sourceUpdateHandler);
    } else {
      console.error("Unrecognized source type: " + this.config.source.type);
    }
  }

  update() {
    if (this.value !== this.textObject.text) {
      // set value
      this.textObject.text = this.value;

      // re-adjust absolute position
      var newPosition = this.hud.calculateAbsolutePosition(this.config.position,
        {width: this.textObject.width, height: this.textObject.height});
      this.textObject.x = newPosition.x;
      this.textObject.y = newPosition.y;
    }
  }

  sourceUpdateHandler(data) {
    if (data[this.config.source.dataField]) {
      this.value = data[this.config.source.dataField];
    } else {
      this.value = "";
    }
  }
}
