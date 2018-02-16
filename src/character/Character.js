const STATUS_EVENT_INTERVAL = 1000 / 30; // 30 / sec

class Character {
  constructor(game, characterConfig, id, enableRendering, remotelyControlled,
    faction) {
    // bind event Listeners
    this.handleRemoteStatusUpdate = this.handleRemoteStatusUpdate.bind(this);
    this.handleInputDown = this.handleInputDown.bind(this);
    this.handleHighlightCharacter = this.handleHighlightCharacter.bind(this);

    this.game = game;
    this.id = id;
    this.characterConfig = characterConfig;
    this.faction = faction;

    // TODO - implement real names
    this.name = characterConfig.spriteName;

    this.enableRendering = enableRendering;
    this.remotelyControlled = remotelyControlled;

    this.moveSpeed = characterConfig.moveSpeed;
    this.target = null;

    if (this.enableRendering) {
      this.sprite = Character.createCharacterSprite(this.game,
        characterConfig.spriteName);
      this.spriteGroup = game.phaserGame.add.group();
      this.spriteGroup.add(this.sprite);
      this.highlightSprite = null;

      // listen for clicks
      this.sprite.events.onInputDown.add(this.handleInputDown, this);

      // listen for highlighting updates
      this.game.eventBus.subscribe("highlight_character",
        this.handleHighlightCharacter);

      // combat text emitted from this character
      this.combatText = new CombatText(this.game, this);
    } else {
      // use dummy sprite objects to store position and velocity
      this.sprite = {x: 0.0, y: 0.0, body: {velocity: {x: 0.0, y: 0.0}}};
      this.highlightSprite = {x: 0, y: 0};
    }

    // animation related variables
    this.currentAnimation = "idle_down";
    this.lastFacing = "down";
    this.animationOverride = null;

    // health tracking
    this.health = characterConfig.maxHealth;
    this.maxHealth = characterConfig.maxHealth;

    // timer values
    this.lastStatusUpdate = 0;
    this.lastUpdateTime = 0;

    // setup remote control if necessary
    if (this.remotelyControlled) {
      this.game.eventBus.subscribeNetwork("character_status_broadcast",
        this.handleRemoteStatusUpdate);
    }
  }

  /* static */
  static createCharacterSprite(game, name) {
    var sprite = game.spriteManager.createSprite(0, 0, name);
    sprite.anchor.setTo(0.5, 0.5);
    sprite.inputEnabled = true;
    game.phaserGame.physics.enable(sprite);
    sprite.body.collideWorldBounds = true
    return sprite;
  }

  static createHighlightedCharacterSprite(phaserGame, physicsEngine, color) {
      var graphics = phaserGame.add.graphics(0, 0);
      graphics.lineStyle(5, color, 1);
      graphics.beginFill(0x000000, 0);
      graphics.drawCircle(0, 0, 110);

      var sprite = phaserGame.add.sprite(0, 0);
      sprite.addChild(graphics);

      return sprite;
  }

  static CalculateAnimation(delta, position, lastFacing, target) {
    // animation and facing is based on movement direction by default
    var facing = lastFacing;
    var movement = "idle";
    if (Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) {
      movement = "walk";

      if (Math.abs(delta.x) > Math.abs(delta.y)) {
        if (delta.x > 0) facing = "right";
        else facing = "left";
      } else {
        if (delta.y > 0) facing = "down";
        else facing = "up";
      }
    }

    // if the character is targeting something, override facing
    if (target) {
      var deltaToTarget = {
        x: target.position.x - position.x,
        y: target.position.y - position.y
      }

      if (Math.abs(deltaToTarget.x) > Math.abs(deltaToTarget.y)) {
        if (deltaToTarget.x > 0) facing = "right";
        else facing = "left";
      } else {
        if (deltaToTarget.y > 0) facing = "down";
        else facing = "up";
      }
    }

    return {facing: facing, animation: movement + "_" + facing};
  }

  /* event Listeners */
  handleRemoteStatusUpdate(data) {
    if (data[this.id]) {
      var updatedStatus = data[this.id];
      this.health = updatedStatus.health;
      this.position = Object.assign({}, updatedStatus.position);
      this.animationOverride = updatedStatus.currentAnimation;
    } else {
      // omission from the update indicates we shouldn't exist anymore
      console.log("remote broadcast destroy");
      if (!this.isDestroyed) this.destroy();
    }
  }

  handleInputDown(gameObject, pointer) {
    // ignore click events if we're distroyed
    if (this.isDestroyed) return;

    // notify that we were clicked using an event
    this.game.eventBus.publish("character_click",
      {characterId: this.id, pointer: pointer});
  }

  handleHighlightCharacter(data) {
    this.isHighlighted = data.characterId === this.id;
  }

  /* game phases */
  update() {
    if (this.enableRendering) {
      // if we are using phaser, velocity is handled automatically
      // check collisions with all map layers
      for (var layer of this.game.mapLayers) {
        this.game.phaserGame.physics.arcade.collide(this.sprite, layer);
      }
    } else {
      // if we're not using phaser, we have to implement velocity manually
      if (this.lastUpdateTime === 0) {
        // this is the first update, don't move yet, just record time
        this.lastUpdateTime = new Date().getTime();
      } else {
        var currentTime = new Date().getTime();
        var timeDelta = (currentTime - this.lastUpdateTime) / 1000.0;
        this.position = {
          x: this.position.x + (this.sprite.body.velocity.x * timeDelta),
          y: this.position.y + (this.sprite.body.velocity.y * timeDelta)
        };

        this.lastUpdateTime = currentTime;
      }
    }

    if (!this.animationOverride) {
      var delta = {
        x: this.sprite.body.velocity.x,
        y: this.sprite.body.velocity.y
      }

      // override target for animation if we're targeting ourselves
      var animationTarget = this.targetingSelf ? null : this.target;
      var calculatedAnimation = Character.CalculateAnimation(delta,
        this.position, this.lastFacing, animationTarget)

      this.lastFacing = calculatedAnimation.facing;
      this.currentAnimation = calculatedAnimation.animation;
    } else {
      this.currentAnimation = this.animationOverride;
    }

    if (this.enableRendering) {
      this.sprite.animations.play(this.currentAnimation);
      this.combatText.update();
    }

    if (this.highlightSprite) {
      this.highlightSprite.x = this.sprite.x;
      this.highlightSprite.y = this.sprite.y;
    }

    // if this character is controlled locally, send a status update
    if (!this.remotelyControlled) {
      var currentTime = new Date().getTime();
      if (this.lastStatusUpdate + STATUS_EVENT_INTERVAL <= currentTime) {
        this.lastStatusUpdate = currentTime;

        var networkStatus = {};
        networkStatus.health = this.health;
        networkStatus.position = Object.assign({}, this.position);
        networkStatus.id = this.id;
        networkStatus.characterConfig = Object.assign({}, this.characterConfig);
        networkStatus.currentAnimation = this.currentAnimation;
        networkStatus.faction = this.faction;
        this.game.eventBus.publishNetwork("character_status", networkStatus)
      }
    }
  }

  /* public Interface */
  setMove(moveX, moveY) {
    if (moveX == 0 && moveY == 0) {
        this.sprite.body.velocity.x = 0;
        this.sprite.body.velocity.y = 0;
    } else {
      // normalize and scale the input based on the move speed of this character
      var preScaleX = moveX * this.moveSpeed;
      var preScaleY = moveY * this.moveSpeed;
      var preScaleTotal = Math.sqrt(Math.pow(preScaleX, 2) + Math.pow(preScaleY, 2));
      var scaleFactor = this.moveSpeed / preScaleTotal;

      // set velocity based on the scale factor calculated
      this.sprite.body.velocity.x = scaleFactor * preScaleX;
      this.sprite.body.velocity.y = scaleFactor * preScaleY;
    }
  }

  destroy() {
    console.log("destroy character");
    if (this.enableRendering) {
      if (this.sprite) {
        this.sprite.destroy();
        delete this.sprite;
      }
      if (this.highlightSprite) {
        this.highlightSprite.destroy();
        delete this.highlightSprite;
      }
      if (this.combatText) {
        this.combatText.destroy();
        delete this.combatText;
      }

      this.game.eventBus.unsubscribe("highlight_character",
        this.handleHighlightCharacter);
    } else {
      delete this.sprite;
      delete this.highlightSprite;
    }

    if (this.remotelyControlled) {
      this.game.eventBus.unsubscribeNetwork("character_status_broadcast",
        this.handleRemoteStatusUpdate);
    }
  }

  applyDamage(amount) {
    this.health -= Math.min(amount, this.health);
    this.combatText.emitNumber(-amount);
  }

  distanceTo(position) {
    var delta = {
      x: Math.abs(position.x - this.position.x),
      y: Math.abs(position.y - this.position.y)
    };
    return Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
  }

  /* public getters / setters */
  get position() {
    return {
      x: this.sprite.x,
      y: this.sprite.y
    };
  }

  set position(position) {
    this.sprite.x = position.x;
    this.sprite.y = position.y;
  }

  get isDestroyed() {
    return this.sprite == null;
  }

  get isDead() {
    return this.health <= 0;
  }

  set isHighlighted(flag)  {
    if (!this.enableRendering) return;

    if (flag) {
      if (!this.highlightSprite) {
        this.highlightSprite = Character.createHighlightedCharacterSprite(this.game.phaserGame,
          this.game.physicsEngine, 0x009900);
        this.spriteGroup.add(this.highlightSprite);
        this.spriteGroup.bringToTop(this.sprite);
      }
    } else {
      if (this.highlightSprite) {
        this.highlightSprite.destroy();
        this.highlightSprite = null;
      }
    }
  }

  get distanceToTarget() {
    var distanceToTarget = -1;
    if (this.target) {
      distanceToTarget = this.distanceTo(this.target.position);
    }
    return distanceToTarget;
  }

  get targetingSelf() {
    return this.target && this.id === this.target.id;
  }

  /* private healpers */

}

if (typeof window === 'undefined') {
  module.exports = Character;
}
