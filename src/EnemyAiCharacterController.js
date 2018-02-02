class EnemyAiCharacterController {
  constructor(character, game, desiredRange) {
    this.game = game;
    this.character = character;
    this.desiredRange = desiredRange;
  }

  update() {
    if (this.character.target) {
      var target = this.character.target;

      var deltaX = target.position.x - this.character.position.x;
      var deltaY = target.position.y - this.character.position.y;

      var distance = this.game.phaserGame.math.distance(
        this.character.position.x,
        this.character.position.y,
        target.position.x,
        target.position.y);

      if (distance > this.desiredRange) {
        deltaX = deltaX / distance;
        deltaY = deltaY / distance;

        // update character state
        var timeDelta = this.game.phaserGame.time.physicsElapsed;
        this.character.position.x += this.character.moveSpeed * timeDelta * deltaX;
        this.character.position.y += this.character.moveSpeed * timeDelta * deltaY;

        // perform character update()
        this.character.update();
      }
    }
  }
}
