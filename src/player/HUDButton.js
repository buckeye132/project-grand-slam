class HUDButton {
  constructor(game, hud, config) {
    this.game = game;
    this.hud = hud;
    this.config = config;

    this.screenPosition = null

    this.group = null;
    this.sprite = null;

    this.value = null;
    this.existingValue = null;
  }

  create(group) {
    this.group = this.game.phaserGame.add.group();
    group.add(this.group);

    this.screenPosition = this.hud.calculateAbsolutePosition(this.config.position,
      this.config.size);

    if (this.config.source.type == "event_bus") {
      this.game.eventBus.subscribe(this.config.source.eventName,
        this.sourceUpdateHandler, this);
    } else {
      console.error("Unrecognized source type: " + this.config.source.type);
    }
  }

  update() {
    if (this.value != this.existingValue) {
      if (this.sprite) {
        this.group.remove(this.sprite, true);
        delete this.sprite;
      }

      this.sprite = this.game.spriteManager.createSprite(
        this.screenPosition.x,
        this.screenPosition.y,
        this.value.spriteName);
      this.sprite.frame = this.value.frame;
      this.sprite.width = this.config.size.width;
      this.sprite.height = this.config.size.height;
      this.sprite.inputEnabled = true;
      if (this.config.destination) {
        this.sprite.events.onInputDown.add(this.clickHandler, this);
      }

      this.group.add(this.sprite);

      this.existingValue = this.value;
    }
  }

  sourceUpdateHandler(data) {
    if (data[this.config.source.dataField]) {
      this.value = data[this.config.source.dataField];
    } else {
      this.value = null;
    }
  }

  clickHandler(gameObject, pointer) {
    if (this.config.destination.type === "event_bus") {
      this.game.eventBus.publish(this.config.destination.eventName,
        {pointer: pointer, eventName: this.config.destination.eventName});
    }
  }
}
