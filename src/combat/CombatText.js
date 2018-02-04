const Y_OFFSET = -50;
const SCROLL_SPEED = 75;
const FADE_SPEED = 0.5;
const FONT = "20px Arial";

class CombatText {
  constructor(game, character) {
    this.game = game;
    this.character = character;

    this.textSprites = [];
  }

  emitNumber(number) {
    var color = "#00ff00";
    if (number <= 0) color = "#ff0000";

    this.emitText(number.toString(), color)
  }

  emitText(text, color) {
    if (!this.character) return;

    var emitPosition = Object.assign({}, this.character.position);
    emitPosition.y += Y_OFFSET;

    var style = {
      font: FONT,
      fill: color,
      align: "center"
    };
    var text = this.game.phaserGame.add.text(emitPosition.x, emitPosition.y,
      text, style);
    text.addColor(color, 0);
    text.anchor.set(0.5);

    this.textSprites.push(text);
  }

  update() {
    var timeDelta = this.game.phaserGame.time.physicsElapsed;

    var finishedSprites = [];
    for (var textSprite of this.textSprites) {
      textSprite.alpha -= Math.min(timeDelta * FADE_SPEED, textSprite.alpha);
      textSprite.y -= timeDelta * SCROLL_SPEED;

      if (textSprite.alpha <= 0) finishedSprites.push(textSprite);
    }

    for (var finishedSprite of finishedSprites) {
      var index = this.textSprites.indexOf(finishedSprite);
      this.textSprites.splice(index, 1);
      finishedSprite.destroy();
    }
  }

  destroy() {
    for (var sprite of this.textSprites) {
      sprite.destroy();
    }
    delete this.textSprites;
  }
}
