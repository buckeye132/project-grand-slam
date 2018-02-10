const EventServer = require('./EventServer');
const EventBus = require('./EventBus');
const LevelManager = require('../level/LevelManager');
const CharacterManager = require('../character/CharacterManager');
const uuid = require('uuid/v4');
const fs = require('fs');
const JSONConfigLoader = require('./JSONConfigLoader');
const Character = require('../character/Character');
const EventEmitter = require('wolfy87-eventemitter');

class ServerClassFactory {
  constructor() {
    this.EventServer = EventServer;
    this.EventBus = EventBus;
    this.LevelManager = LevelManager;
    this.CharacterManager = CharacterManager;
    this.uuid = uuid;
    this.JSONConfigLoader = JSONConfigLoader;
    this.Character = Character;
    this.fs = fs;
    this.EventEmitter = EventEmitter;
  }
}

if (typeof window === 'undefined') {
  module.exports = ServerClassFactory;
}
