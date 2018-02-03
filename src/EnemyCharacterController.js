const DEFUALT_DESIRED_RANGE = 80;
const DEFAULT_AGRO_RANGE = 300;
const DEFAULT_CHASE_DISTANCE = 500;

class EnemyCharacterController {
  constructor(character, game) {
    this.game = game;
    this.character = character;

    this.desiredRange = DEFUALT_DESIRED_RANGE;
    this.agroRange = DEFAULT_AGRO_RANGE;
    this.chaseDistance = DEFAULT_CHASE_DISTANCE;

    this.initialPosition = Object.assign({}, this.character.position);

    // detect mouse click input
    this.character.onInputDown(this.clickCallback, this);

    // listen for enemy_click events to control highlighting
    this.game.eventBus.subscribe("enemy_click", this.enemyClickListener, this);

    // listen for players to broadcast their position
    this.game.eventBus.subscribe("player_position", this.playerPositionListener, this);
  }

  /* Input Callbacks */
  clickCallback(gameObject, pointer) {
    this.game.eventBus.publish("enemy_click", {enemyController: this, pointer: pointer});
  }

  /* Event Bus Listeners */
  enemyClickListener(data) {
    if (data.enemyController == this) {
      this.character.isHighlighted = true;
    } else {
      this.character.isHighlighted = false;
    }
  }

  playerPositionListener(data) {
    if (!this.character.target) {
      // quick exit
      if (Math.abs(data.position.x - this.character.position.x) > this.agroRange ||
          Math.abs(data.position.y - this.character.position.y) > this.agroRange) {
        return;
      }

      // deeper distance check
      var playerPosition = data.position;
      var distanceToPlayer = this.game.phaserGame.math.distance(
        this.character.position.x,
        this.character.position.y,
        playerPosition.x,
        playerPosition.y);

      if (distanceToPlayer <= this.agroRange) {
        // check that player can be reached
        var playerDistanceFromHome = this.game.phaserGame.math.distance(
          this.initialPosition.x,
          this.initialPosition.y,
          playerPosition.x,
          playerPosition.y);
        if (playerDistanceFromHome < this.chaseDistance + this.desiredRange) {
          // we're in range of a player, get 'm
          this.character.target = data.playerController.character;
        }
      }
    }
  }

 /* Public Functions */
  update() {
    // check if we've gone too far away from our initial position
    var distanceFromHome = this.game.phaserGame.math.distance(
      this.character.position.x,
      this.character.position.y,
      this.initialPosition.x,
      this.initialPosition.y);
    if (distanceFromHome > this.chaseDistance) {
      // we've gone too far, break off the chase
      this.character.target = null;
    }

    // decide where we're going
    var targetPosition = this.initialPosition;
    var targetRange = 1;
    if (this.character.target) {
      targetPosition = this.character.target.position;
      targetRange = this.desiredRange;
    }

    // decide how far to move and in what direction
    var deltaX = targetPosition.x - this.character.position.x;
    var deltaY = targetPosition.y - this.character.position.y;

    var distance = this.game.phaserGame.math.distance(
      this.character.position.x,
      this.character.position.y,
      targetPosition.x,
      targetPosition.y);

    if (distance > targetRange) {
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

  destroy() {
    this.character.destroy();
    this.game.eventBus.unsubscribe("enemy_click", this.enemyClickListener);
  }
}
