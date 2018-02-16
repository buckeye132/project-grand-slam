class EventBus {
  constructor(game, playerId = null) {
    this.eventEmitter = new game.factory.EventEmitter();
    this.playerId = playerId;

    if (this.isClient) {
      this.socket = io('/' + game.gameId);
      this.socket.on('connect', function() {
        this.socket.emit('player_id', {playerId: this.playerId});

        this.socket.emit('random_event', {playerId: this.playerId});
      }.bind(this));
    } else {
      // create a loop-back network event bus
      this.loopBackBus = new game.factory.EventEmitter();
    }
  }

  /*
   * local events
   */
  subscribe(eventName, listener) {
    this.eventEmitter.addListener(eventName, listener);
  }

  unsubscribe(eventName, listener) {
    this.eventEmitter.removeListener(eventName, listener);
  }

  publish(eventName, data) {
    this.eventEmitter.emitEvent(eventName, [data]);
  }

  /*
   * network events (from server)
   */
  subscribeNetwork(eventName, listener) {
    if (this.isClient) {
      if (this.socket) this.socket.on(eventName, listener);
    } else {
      this.loopBackBus.addListener(eventName, listener);
    }
  }

  unsubscribeNetwork(eventName, listener) {
    if (this.isClient) {
      if (this.socket) {
        this.socket.removeListener(eventName, listener);
      }
    } else {
      console.log("remove from loopback");
      this.loopBackBus.removeListener(eventName, listener);
    }
  }

  publishNetwork(eventName, data) {
    if (this.isClient) {
      if (this.socket) this.socket.emit(eventName, data);
    } else {
      this.loopBackBus.emitEvent(eventName, [data]);
    }
  }

  /*
   * private helper
   */
  get isClient() {
    return (this.playerId !== null);
  }

  get isServer() {
    return (this.playerId === null);
  }
}

if (typeof window === 'undefined') {
  module.exports = EventBus;
}
