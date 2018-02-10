class EventBus {
  constructor(game, playerId = null) {
    this.eventEmitter = new game.factory.EventEmitter();
    this.playerId = playerId;

    if (playerId) {
      this.socket = io('/' + game.gameId);
      this.socket.on('connect', function() {
        this.socket.emit('player_id', {playerId: this.playerId});

        this.socket.emit('random_event', {playerId: this.playerId});
      }.bind(this));
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
    if (this.socket) this.socket.on(eventName, listener.bind(context));
  }

  publishNetwork(eventName, data) {
    if (this.socket) this.socket.emit(eventName, data);
  }
}

if (typeof window === 'undefined') {
  module.exports = EventBus;
}
