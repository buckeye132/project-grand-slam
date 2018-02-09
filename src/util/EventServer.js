if (typeof window === 'undefined') {
  var EventEmitter = require('events');
}

class EventServer {
  constructor(gameId, io) {
    this.nsp = io.of('/' + gameId);
    this.eventEmitter = new EventEmitter();

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
          this.eventEmitter.emit(eventName, {playerId: socket.playerId, data: data});
        }
      }.bind(this));

    }.bind(this));
  }

  subscribePlayerJoin(listener, context) {
    this.eventEmitter.on("player_join", listener.bind(context));
  }

  subscribePlayerLeave(listener, context) {
    this.eventEmitter.on("player_left", listener.bind(context));
  }

  subscribe(eventName, listener, context) {
    this.eventEmitter.on(eventName, listener.bind(context));
  }

  broadcast(eventName, data) {
    this.nsp.emit(eventName, data);
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
    return this.playerSockets.keys();
  }
}

if (typeof window === 'undefined') {
  module.exports = EventServer;
}
