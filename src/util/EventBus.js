class EventBus {
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  subscribe(eventName, listener, context) {
    this.eventEmitter.addListener(eventName, listener.bind(context));
  }
  
  unsubscribe(eventName, listener, context) {
    this.eventEmitter.removeListener(eventName, listener.bind(context));
  }

  publish(eventName, data) {
    this.eventEmitter.emitEvent(eventName, [data]);
  }

}
