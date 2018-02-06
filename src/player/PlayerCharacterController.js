const CHARACTER_KEY_BINDINGS = new Map(
  [["MOVE_UP", Phaser.KeyCode.W],
  ["MOVE_DOWN", Phaser.KeyCode.S],
  ["MOVE_LEFT", Phaser.KeyCode.A],
  ["MOVE_RIGHT", Phaser.KeyCode.D],
  ["CANCEL", Phaser.KeyCode.ESC]]);
const CHARACTER_KEY_CAPTURES = [Phaser.KeyCode.ESC];
const POSITION_EVENT_INTERVAL = 500; // half second between events

class PlayerCharacterController {
  constructor(x, y, buildConfig, game) {
    this.game = game;
    this.nextPositionEventIn = 0;

    this.character = new Character(x, y, this.game, buildConfig.spriteName,
      "Player", buildConfig.moveSpeed, buildConfig.maxHealth);

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

    // equip a basic melee weapon
    this.weapon = this.game.weaponManager.createWeapon(buildConfig.weapon);
    this.autoAttacking = false;

    // equip skills
    this.skills = [];
    for (var i = 0; i < buildConfig.skills.length; i++) {
      var skill = this.game.skillManager.createSkill(buildConfig.skills[i]);
      skill.publishIcon("set_skill_" + i.toString());
      this.skills.push(skill);
      this.game.eventBus.subscribe("skill_" + i.toString() + "_click",
        this.skillClickListener, this);
    }
  }

  enemyClickListener(data) {
    if (this.character.isDead) return;

    if (!data.enemyController) {
      this.character.target = null;
      this.autoAttacking = false;
    } else {
      this.character.target = data.enemyController.character;
      if (data.pointer.rightButton.isDown) {
        this.autoAttacking = true;
      }
    }
  }

  skillClickListener(data) {
    if (this.character.isDead) return;

    if (data.pointer.leftButton.isDown &&
        this.character.target &&
        !this.character.target.isDead) {
      var skill = this.skills[data.payload.slotNumber];
      skill.useOn(this.character.target, this.character.distanceToTarget);
    }
  }

  update() {
    // did we die?
    if (this.character.isDead) {
      this.destroy();
      return;
    }

    // is our target dead?
    if (this.character.target && this.character.target.isDead) {
      this.character.target = null;
      this.autoAttacking = false;
    }

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

    // perform child object update()
    this.character.update();
    this.weapon.update();
    for (var skill of this.skills) {
      skill.update();
    }

    // check auto attack
    if (this.character.target && this.autoAttacking) {
      if (this.weapon.canHit(this.character.distanceToTarget)) {
        this.weapon.attack(this.character.target, this.character.distanceToTarget);
      } else {
        // if we're out of range, cancel auto attack
        this.autoAttacking = false;
      }
    }

    // broadcast our position
    this.nextPositionEventIn -= timeDelta*1000;
    if (this.nextPositionEventIn < 0) {
      this.nextPositionEventIn += POSITION_EVENT_INTERVAL;
      this.game.eventBus.publish("player_position",
        {playerController: this, position: this.character.position});
    }

    // broadcast our status
    var status = {};
    status.healthPercent = (this.character.health / this.character.maxHealth);
    if (this.character.target) {
      status.targetHealthPercent =
        (this.character.target.health / this.character.target.maxHealth);
      status.targetName = this.character.target.name;
    }
    this.game.eventBus.publish("player_status", status);
  }

  destroy() {
    this.character.destroy();
    this.game.eventBus.unsubscribe("enemy_click", this.enemyClickListener, this);
    for (var i = 0; i < this.skills.length; i++) {
      this.game.eventBus.unsubscribe("skill_" + i.toString() + "_click",
        this.enemyClickListener, this);
    }
  }

  get isDestroyed() {
    return this.character.isDestroyed;
  }
}
