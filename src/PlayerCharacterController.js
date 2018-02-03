const CHARACTER_KEY_BINDINGS = new Map(
  [["MOVE_UP", Phaser.KeyCode.W],
  ["MOVE_DOWN", Phaser.KeyCode.S],
  ["MOVE_LEFT", Phaser.KeyCode.A],
  ["MOVE_RIGHT", Phaser.KeyCode.D],
  ["CANCEL", Phaser.KeyCode.ESC]]);
const CHARACTER_KEY_CAPTURES = [Phaser.KeyCode.ESC];
const POSITION_EVENT_INTERVAL = 500; // half second between events

class PlayerCharacterController {
  constructor(character, game) {
    this.character = character;
    this.game = game;

    this.nextPositionEventIn = 0;

    // initialize keyboard input
    for (var keyCapture of CHARACTER_KEY_CAPTURES) {
      this.game.phaserGame.input.keyboard.addKeyCapture(keyCapture);
    }
    this.keyMap = new Map();
    for (let [alias, keycode] of CHARACTER_KEY_BINDINGS) {
      var key = this.game.phaserGame.input.keyboard.addKey(keycode);
      this.keyMap.set(alias, key);
    }

    // listen for enemy_click events to set targeting
    this.game.eventBus.subscribe("enemy_click", this.enemyClickListener, this);
  }

  enemyClickListener(data) {
    if (!data.enemyController) {
      this.character.target = null;
    } else {
      this.character.target = data.enemyController.character;
    }
  }

  update() {
    // capture input from keyboard
    var moveX = 0;
    var moveY = 0;
    if (this.keyMap.get("MOVE_UP").isDown) {
      moveY--;
    }
    if (this.keyMap.get("MOVE_DOWN").isDown) {
      moveY++;
    }
    if (this.keyMap.get("MOVE_LEFT").isDown) {
      moveX--;
    }
    if (this.keyMap.get("MOVE_RIGHT").isDown) {
      moveX++;
    }
    if (this.keyMap.get("CANCEL").isDown) {
      this.game.eventBus.publish("enemy_click", {enemyController: null, pointer: null});
    }

    // update character state
    var timeDelta = this.game.phaserGame.time.physicsElapsed;
    this.character.position.x += this.character.moveSpeed * timeDelta * moveX;
    this.character.position.y += this.character.moveSpeed * timeDelta * moveY;

    // perform character update()
    this.character.update();

    // broadcast our position
    this.nextPositionEventIn -= timeDelta*1000;
    if (this.nextPositionEventIn < 0) {
      this.nextPositionEventIn += POSITION_EVENT_INTERVAL;
      this.game.eventBus.publish("player_position",
        {playerController: this, position: this.character.position});
    }
  }
}
