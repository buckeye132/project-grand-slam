class EventServer {
  constructor(game, io) {
    this.game = game;
    this.nsp = io.of('/' + game.gameId);
    this.eventEmitter = new game.factory.EventEmitter();

    this.playerSockets = new Map();

    this.nsp.on('connection', function(socket) {

      socket.on('player_id', function(data){
        console.log("New player connected with ID: " + data.playerId);
        // TODO - check for conflict
        socket.playerId = data.playerId
        this.playerSockets.set(data.playerId, socket);
        this.eventEmitter.emit("player_join", {playerId: data.playerId});
      }.bind(this));

      socket.on('disconnect',function(){
        console.log("Player left: " + socket.playerId);
        this.playerSockets.delete(socket.playerId);
        this.eventEmitter.emit("player_left", {playerId: socket.playerId});
      }.bind(this));

      // this sets up support for wild card event handlers
      var onevent = socket.onevent;
      socket.onevent = function (packet) {
          var args = packet.data || [];
          onevent.call (this, packet);    // original call
          packet.data = ["*"].concat(args);
          onevent.call(this, packet);      // additional call to catch-all
      };

      socket.on("*",function(eventName,data) {
        if (eventName !== 'player_left') {
          this.eventEmitter.emitEvent(eventName,
            [{playerId: socket.playerId, data: data}]);
        }
      }.bind(this));

    }.bind(this));
  }

  subscribePlayerJoin(listener, context) {
    this.eventEmitter.addListener("player_join", listener.bind(context));
  }

  subscribePlayerLeave(listener, context) {
    this.eventEmitter.addListener("player_left", listener.bind(context));
  }

  subscribe(eventName, listener, context) {
    this.eventEmitter.addListener(eventName, listener.bind(context));
    this.game.eventBus.subscribeNetwork(eventName, function(data) {
        this.listener({playerId: null, data: data})
      }, {listener: listener.bind(context)});
  }

  broadcast(eventName, data) {
    this.nsp.emit(eventName, data);
    this.game.eventBus.publishNetwork(eventName, data);
  }

  emit(playerId, eventName, data) {
    var playerSocket = this.playerSockets.get(playerId);
    if (playerSocket) {
      playerSocket.emit(eventName, data);
    }
  }

  get playerCount() {
    return this.playerSockets.size
  }

  get playerList() {
    return Array.from( this.playerSockets.keys() );
  }
}

if (typeof window === 'undefined') {
  module.exports = EventServer;
}
