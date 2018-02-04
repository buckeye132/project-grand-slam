DEFAULT_MAX_HEALTH = 100;

class Character {
  constructor(x, y, game, spriteName, name, moveSpeed = 100) {
    this.position = {x: x, y: y};
    this.game = game;
    this.name = name;

    this.moveSpeed = moveSpeed;
    this.target = null;

    this.spriteGroup = this.game.phaserGame.add.group();
    this.sprite = Character.createCharacterSprite(this.game, spriteName);
    this.highlightSprite = null;

    this.spriteGroup.add(this.sprite);
    this.spriteGroup.x = x;
    this.spriteGroup.y = y;

    this.lastFacing = "down";

    this.health = DEFAULT_MAX_HEALTH;
    this.maxHealth = DEFAULT_MAX_HEALTH;

    this.combatText = new CombatText(this.game, this);
  }

  static createCharacterSprite(game, name) {
    var sprite = game.spriteManager.createSprite(0, 0, name);
    sprite.anchor.setTo(0.5, 0.5);
    sprite.inputEnabled = true;

    game.phaserGame.physics.enable([ sprite ], game.physicsEngine);

    return sprite;
  }

  static createHighlightedCharacterSprite(phaserGame, physicsEngine, color) {
      var graphics = phaserGame.add.graphics(0, 0);
      graphics.lineStyle(5, color, 1);
      graphics.beginFill(0x000000, 0);
      graphics.drawCircle(0, 0, 110);

      var sprite = phaserGame.add.sprite(0, 0);
      sprite.addChild(graphics);

      phaserGame.physics.enable([ sprite ], physicsEngine);

      return sprite;
  }

  update() {
    var delta = {
      x: this.position.x - this.spriteGroup.x,
      y: this.position.y - this.spriteGroup.y
    }

    this.spriteGroup.x = this.position.x;
    this.spriteGroup.y = this.position.y;

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

    this.sprite.animations.play(movement + "_" + facing);
    this.lastFacing = facing;

    this.combatText.update();
  }

  destroy() {
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
