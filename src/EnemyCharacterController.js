const DEFUALT_DESIRED_RANGE = 80;

class EnemyCharacterController {
  constructor(character, game) {
    this.game = game;
    this.character = character;

    this.desiredRange = DEFUALT_DESIRED_RANGE;

    // detect mouse click input
    this.character.onInputDown(this.clickCallback, this);

    // listen for enemy_click events to control highlighting
    this.game.eventBus.subscribe("enemy_click", this.enemyClickListener, this);
  }

  clickCallback(gameObject, pointer) {
    this.game.eventBus.publish("enemy_click", {enemyController: this, pointer: pointer});
  }

  enemyClickListener(data) {
    if (data.enemyController == this) {
      this.character.isHighlighted = true;
    } else {
      this.character.isHighlighted = false;
    }
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

      }
      
      // perform character update()
      this.character.update();
    }
  }

  destroy() {
    this.character.destroy();
    this.game.eventBus.unsubscribe("enemy_click", this.enemyClickListener);
  }
}
