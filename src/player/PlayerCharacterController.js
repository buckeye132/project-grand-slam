const CHARACTER_KEY_BINDINGS = new Map(
  [["MOVE_UP", Phaser.KeyCode.W],
  ["MOVE_DOWN", Phaser.KeyCode.S],
  ["MOVE_LEFT", Phaser.KeyCode.A],
  ["MOVE_RIGHT", Phaser.KeyCode.D],
  ["CANCEL", Phaser.KeyCode.ESC]]);
const CHARACTER_KEY_CAPTURES = [Phaser.KeyCode.ESC];
const POSITION_EVENT_INTERVAL = 1000 / 30; // 30 / sec
const PLAYER_FACTION = "player";

class PlayerCharacterController {
  constructor(x, y, buildConfig, game) {
    this.game = game;
    this.playerId = game.playerId; // take id of local player
    this.nextPositionEventIn = 0;
    this.buildConfig = buildConfig;

    this.character = new Character(this.game, buildConfig.characterConfig,
      this.playerId, true, false, PLAYER_FACTION);
    this.character.position = { x: x, y: y };
    this.game.phaserGame.camera.follow(this.character.sprite,
      Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    // initialize keyboard input
    for (var keyCapture of CHARACTER_KEY_CAPTURES) {
      this.game.phaserGame.input.keyboard.addKeyCapture(keyCapture);
    }
    this.keyMap = new Map();
    for (let [alias, keycode] of CHARACTER_KEY_BINDINGS) {
      var key = this.game.phaserGame.input.keyboard.addKey(keycode);
      this.keyMap.set(alias, key);
    }

    // listen for characters being clicked by the player
    this.game.eventBus.subscribe("character_click", this.characterClickListener,
      this);

    // equip a basic melee weapon
    //this.weapon = this.game.weaponManager.createWeapon(buildConfig.weapon);
    this.autoAttacking = false;

    // equip skills
    this.skills = [];
    /*for (var i = 0; i < buildConfig.skills.length; i++) {
      var skill = this.game.skillManager.createSkill(buildConfig.skills[i]);
      skill.publishIcon("set_skill_" + i.toString());
      this.skills.push(skill);
      this.game.eventBus.subscribe("skill_" + i.toString() + "_click",
        this.skillClickListener, this);
    }*/
  }

  /* Event Handlers */
  characterClickListener(data) {
    // ignore clicking if we're dead
    if (this.character.isDead) return;

    if (!data.characterId) {
      // null character ID indicates cancel request (untarget)
      this.character.target = null;
      this.autoAttacking = false;
    } else {
      // find the character that was clicked
      var character = this.game.characterManager.findCharacterById(
        data.characterId);
      if (character === null) {
        console.error("Cannot find character that was clicked!");
        return;
      }

      this.character.target = character;
      if (data.pointer.rightButton.isDown &&
          this.faction !== character.faction) {
        // if it's an enemy and the player requested attack, start attacking
        this.autoAttacking = true;
      }
    }

    // publish an event to update who's highlighted
    this.game.eventBus.publish("highlight_character",
      {characterId: data.characterId});
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

  /* Game Loop */
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
      this.game.eventBus.publish("character_click",
        {characterId: null, pointer: null});
    }

    // update character state
    this.character.setMove(moveX, moveY);

    // perform child object update()
    this.character.update();
    /*this.weapon.update();
    for (var skill of this.skills) {
      skill.update();
    }*/

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
    var hudStatus = {};
    hudStatus.healthPercent = (this.health / this.maxHealth);
    if (this.character.target) {
      hudStatus.targetHealthPercent =
        (this.character.target.health / this.character.target.maxHealth);
      hudStatus.targetName = this.character.target.name;
    }
    this.game.eventBus.publish("hud_status", hudStatus);
  }

  /* Public Interface */
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

  get faction() {
    return this.character.faction;
  }

  get id() {
    return this.character.id;
  }

  get name() {
    return this.character.name;
  }

  get health() {
    return this.character.health;
  }

  get maxHealth() {
    return this.character.maxHealth;
  }
}
