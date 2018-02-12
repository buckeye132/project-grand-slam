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
  subscribe(eventName, listener, context) {
    this.eventEmitter.addListener(eventName, listener.bind(context));
  }

  unsubscribe(eventName, listener, context) {
    this.eventEmitter.removeListener(eventName, listener.bind(context));
  }

  publish(eventName, data) {
    this.eventEmitter.emitEvent(eventName, [data]);
  }

  /*
   * network events (from server)
   */
  subscribeNetwork(eventName, listener, context) {
    if (this.isClient) {
      if (this.socket) this.socket.on(eventName, listener.bind(context));
    } else {
      this.loopBackBus.addListener(eventName, listener.bind(context));
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
