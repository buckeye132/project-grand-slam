class Character {
  constructor(x, y, game, spriteName, name, moveSpeed, maxHealth) {
    this.game = game;
    this.name = name;

    this.moveSpeed = moveSpeed;
    this.target = null;

    this.sprite = Character.createCharacterSprite(this.game, spriteName);
    this.spriteGroup = game.phaserGame.add.group();
    this.spriteGroup.add(this.sprite);
    this.highlightSprite = null;

    this.sprite.x = x;
    this.sprite.y = y;
    this.previousPosition = {x: 0, y: 0};

    this.currentAnimation = "idle_down";
    this.lastFacing = "down";
    this.animationOverride = null;

    this.health = maxHealth;
    this.maxHealth = maxHealth;

    this.combatText = new CombatText(this.game, this);
  }

  static createCharacterSprite(game, name) {
    var sprite = game.spriteManager.createSprite(0, 0, name);
    sprite.anchor.setTo(0.5, 0.5);
    sprite.inputEnabled = true;

    //game.phaserGame.physics.enable([ sprite ], game.physicsEngine);
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

  setMove(moveX, moveY) {
    if (moveX == 0 && moveY == 0) {
      this.sprite.body.velocity.x = 0;
      this.sprite.body.velocity.y = 0;
    } else {
      var preScaleX = moveX * this.moveSpeed;
      var preScaleY = moveY * this.moveSpeed;
      var preScaleTotal = Math.sqrt(Math.pow(preScaleX, 2) + Math.pow(preScaleY, 2));
      var factor = this.moveSpeed / preScaleTotal;
      this.sprite.body.velocity.x = factor * preScaleX;
      this.sprite.body.velocity.y = factor * preScaleY;
    }
  }

  get position() {
    return {
      x: this.sprite.x,
      y: this.sprite.y
    };
  }

  set position(position) {
    this.previousPosition.x = this.sprite.x;
    this.previousPosition.y = this.sprite.y;
    this.sprite.x = position.x;
    this.sprite.y = position.y;
  }

  update() {
    var delta = null
    if (!this.animationOverride) {
      delta = {
        x: this.sprite.body.velocity.x,
        y: this.sprite.body.velocity.y
      }
    }

    // check collisions with all map layers
    for (var layer of this.game.mapLayers) {
      this.game.phaserGame.physics.arcade.collide(this.sprite, layer);
    }

    if (!this.animationOverride) {
      // animation and facing is based on movement direction by default
      var facing = this.lastFacing;
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
      if (this.target) {
        var deltaToTarget = {
          x: this.target.position.x - this.position.x,
          y: this.target.position.y - this.position.y
        }

        if (Math.abs(deltaToTarget.x) > Math.abs(deltaToTarget.y)) {
          if (deltaToTarget.x > 0) facing = "right";
          else facing = "left";
        } else {
          if (deltaToTarget.y > 0) facing = "down";
          else facing = "up";
        }
      }

      this.lastFacing = facing;
      this.currentAnimation = movement + "_" + facing;
    } else {
      this.currentAnimation = this.animationOverride;
    }

    this.sprite.animations.play(this.currentAnimation);

    if (this.highlightSprite) {
      this.highlightSprite.x = this.sprite.x;
      this.highlightSprite.y = this.sprite.y;
    }

    this.combatText.update();
  }

  destroy() {
    console.log("destroy");
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
  }

  get isDestroyed() {
    return this.sprite == null;
  }

  onInputDown(callback, context) {
    this.sprite.events.onInputDown.add(callback, context);
  }

  applyDamage(amount) {
    console.log("Taking damage " + amount);
    this.health -= Math.min(amount, this.health);
    this.combatText.emitNumber(-amount);
  }

  get isDead() {
    return this.health <= 0;
  }

  set isHighlighted(flag)  {
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
      distanceToTarget = this.game.phaserGame.math.distance(
        this.position.x,
        this.position.y,
        this.target.position.x,
        this.target.position.y);
    }
    return distanceToTarget;
  }

  distanceTo(position) {
    return this.game.phaserGame.math.distance(
      this.position.x,
      this.position.y,
      position.x,
      position.y);
  }
}
