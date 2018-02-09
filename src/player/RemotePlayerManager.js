class RemotePlayerManager {
  constructor(game, localPlayerId) {
    this.game = game;
    this.localPlayerId = localPlayerId;

    this.game.eventBus.subscribeNetwork("player_status",
      this.playerStatusHandler, this);
    this.game.eventBus.subscribeNetwork("player_list",
      this.playerListHandler, this);

    this.remotePlayers = new Map();
  }

  update() {
    for (var playerId of this.remotePlayers.keys()) {
      this.remotePlayers.get(playerId).update();
    }
  }

  playerStatusHandler(data) {
    if (data.playerId !== this.localPlayerId &&
        !this.remotePlayers.has(data.playerId)) {
      // we don't know about this player yet
      var newPlayer = new RemotePlayerCharacterController(this.game, data.playerId);
      this.remotePlayers.set(data.playerId, newPlayer);
      newPlayer.playerStatusHandler(data);
    }
  }

  playerListHandler(data) {
    var playersToRemove = [];
    for (var playerId of this.remotePlayers.keys()) {
      if (!data.playerIds.includes(playerId)) {
        playersToRemove.push(playerId);
      }
    }

    for (var playerToRemove of playersToRemove) {
      this.remotePlayers.get(playerToRemove).destroy();
      this.remotePlayers.delete(playerToRemove);
    }
  }
}
