const ServerClassFactory = require('./util/ServerClassFactory');

const SERVER_TIMEOUT = 10000; // temp - 10 seconds
const TICK_TIME = 1000 / 60 // 60 TICK / SEC

class GrandSlamGameServer {
  constructor(gameId, io) {
    console.log("Game Server Starting: ", gameId);
    this.gameId = gameId;
    this.becameEmptyAt = 0;

    this.factory = new ServerClassFactory();

    // create local and network event bus
    this.eventServer = new this.factory.EventServer(this, io);
    this.eventBus = new this.factory.EventBus(this);

    // create child game objects
    this.levelManager = new this.factory.LevelManager(
      "assets/config/test_level.json", this);
    this.characterManager = new this.factory.CharacterManager(this, false);

    // subscribe event listeners
    this.eventServer.subscribePlayerLeave(this.playerLeave, this);
    this.characterManager.enableEvents();

    // set game loop interval
    setInterval(this.update.bind(this), TICK_TIME);
  }

  /* Event Handlers */
  playerLeave(data) {
    this.eventServer.broadcast("player_list",
      {playerIds: this.eventServer.playerList});
    if (this.eventServer.playerCount == 0) {
      this.becameEmptyAt = new Date().getTime();
    }
  }

  /* Game Loop*/
  update() {
    this.characterManager.update();
  }

  /* Public Interface */
  get hasTimeoutExpired() {
    return this.eventServer.playerCount == 0 &&
      (this.becameEmptyAt + SERVER_TIMEOUT <= new Date().getTime());
  }

}

if (typeof window === 'undefined') {
  module.exports = GrandSlamGameServer;
}
