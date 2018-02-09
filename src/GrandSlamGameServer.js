if (typeof window === 'undefined') {
  var EventServer = require('./util/EventServer');
}

const SERVER_TIMEOUT = 10000; // temp - 10 seconds

class GrandSlameGameServer {
  constructor(gameId, io) {
    console.log("Game Server Starting: ", gameId);
    this.becameEmptyAt = 0;

    this.eventServer = new EventServer(gameId, io);

    this.eventServer.subscribePlayerLeave(this.playerLeave, this);
    this.eventServer.subscribePlayerJoin(this.playerJoin, this);

    this.eventServer.subscribe("player_status", this.playerStatus, this);

    this.playerList = [];
  }

  playerLeave(data) {
    this.eventServer.broadcast("player_list",
      {playerIds: this.eventServer.playerList});
    if (this.eventServer.playerCount == 0) {
      this.becameEmptyAt = new Date().getTime();
    }
  }

  playerJoin(data) {
    this.eventServer.broadcast("player_list",
      {playerIds: this.eventServer.playerList});
  }

  playerStatus(data) {
    // TODO - aggregate and send single broadcast for all players
    this.eventServer.broadcast("player_status", data.data);
  }

  get hasTimeoutExpired() {
    return this.eventServer.playerCount == 0 &&
      (this.becameEmptyAt + SERVER_TIMEOUT <= new Date().getTime());
  }

}

if (typeof window === 'undefined') {
  module.exports = GrandSlameGameServer;
}
