class Character {
  constructor(x, y, game, spriteName, moveSpeed = 100) {
    this.position = {x: x, y: y};
    this.game = game;

    this.moveSpeed = moveSpeed;
    this.target = null;

    this.spriteGroup = this.game.phaserGame.add.group();
    this.sprite = Character.createCharacterSprite(this.game, spriteName);
    this.highlightSprite = null;

    this.spriteGroup.add(this.sprite);
    this.spriteGroup.x = x;
    this.spriteGroup.y = y;

    this.lastFacing = "down";
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
      graphics.beginFill(color, 1);
      graphics.drawCircle(0, 0, 96);

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

    this.sprite.animations.play(movement + "_" + facing);
    this.lastFacing = facing;
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    if (this.highlightSprite) {
      this.highlightSprite.destroy();
      this.highlightSprite = null;
    }
  }

  onInputDown(callback, context) {
    this.sprite.events.onInputDown.add(callback, context);
  }

  set isHighlighted(flag)  {
    if (flag) {
      if (!this.highlightSprite) {
        this.highlightSprite = Character.createHighlightedCharacterSprite(this.game.phaserGame,
          this.game.physicsEngine, 0x00cc00);
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
}