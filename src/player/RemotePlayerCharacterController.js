class RemotePlayerCharacterController {
  constructor(game, playerId) {
    this.game = game;
    this.playerId = playerId;

    // lazy loaded with first status update
    this.character = null;

    // subscribe for position updates from the server
    this.game.eventBus.subscribeNetwork("player_status",
      this.playerStatusHandler, this);
  }

  playerStatusHandler(data) {
    if (data.playerId === this.playerId) {
      if (!this.character) {
        var buildConfig = data.buildConfig;
        this.character = new Character(data.position.x, data.position.y,
          this.game, buildConfig.spriteName, this.playerId,
          buildConfig.moveSpeed, buildConfig.maxHealth);
      } else {
          this.character.position = data.position;
      }
    }
  }

  update() {
    if (this.character) {
      this.character.update();
    }
  }

  destroy() {
    if (this.character) {
      this.character.destroy();
      delete this.character;
    }
  }

}
