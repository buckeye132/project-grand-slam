class Character {
  constructor(x, y, game, color, moveSpeed = 100) {
    this.position = {x: x, y: y};
    this.game = game;

    this.moveSpeed = moveSpeed;
    this.target = null;

    this.spriteGroup = this.game.phaserGame.add.group();
    this.sprite = Character.createCharacterSprite(this.game.phaserGame,
      this.game.physicsEngine, color);
    this.sprite.events.onInputDown.add(this.onInputDown,this);
    this.highlightSprite = null;

    this.spriteGroup.add(this.sprite);
    this.spriteGroup.x = x;
    this.spriteGroup.y = y;

    this.clickCallback = null;
  }

  static createCharacterSprite(phaserGame, physicsEngine, color) {
    var graphics = phaserGame.add.graphics(0, 0);
    graphics.beginFill(color, 1);
    graphics.drawCircle(0, 0, 48);

    var sprite = phaserGame.add.sprite(0, 0);
    sprite.addChild(graphics);
    sprite.inputEnabled = true;

    phaserGame.physics.enable([ sprite ], physicsEngine);

    return sprite;
  }

  static createHighlightedCharacterSprite(phaserGame, physicsEngine, color) {
      var graphics = phaserGame.add.graphics(0, 0);
      graphics.beginFill(color, 1);
      graphics.drawCircle(0, 0, 54);

      var sprite = phaserGame.add.sprite(0, 0);
      sprite.addChild(graphics);

      phaserGame.physics.enable([ sprite ], physicsEngine);

      return sprite;
  }

  update() {
    this.spriteGroup.x = this.position.x;
    this.spriteGroup.y = this.position.y;
  }

  destroy() {
    this.sprite.destroy();
    this.sprite = null;
  }

  onInputDown() {
    if (this.clickCallback) {
      this.clickCallback(this);
    }
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
