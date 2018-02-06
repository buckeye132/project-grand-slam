class EnemyCharacterController {
  constructor(x, y, config, game) {
    this.game = game;
    this.character = new Character(x, y, game, config.spriteName, config.name,
      config.movementSpeed, config.maxHealth);
    this.desiredRange = config.desiredRange;
    this.agroRange = config.agroRange;
    this.chaseDistance = config.chaseDistance;

    if (config.weaponName) {
      this.weapon = this.game.weaponManager.createWeapon(config.weaponName);
    }

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
    if (this.isDestroyed) {
      return;
    }

    this.game.eventBus.publish("enemy_click", {enemyController: this, pointer: pointer});
  }

  /* Event Bus Listeners */
  enemyClickListener(data) {
    if (this.isDestroyed) {
      return;
    }

    if (data.enemyController == this) {
      this.character.isHighlighted = true;
    } else {
      this.character.isHighlighted = false;
    }
  }

  playerPositionListener(data) {
    if (this.isDestroyed) {
      return;
    }

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
    // did we die?
    if (this.character.isDead) {
      this.destroy();
      return;
    }

    // is our target dead?
    if (this.character.target && this.character.target.isDead) {
      this.character.target = null;
    }

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

    var distance = this.character.distanceTo(targetPosition);

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
    this.weapon.update();

    // try attacking
    if (this.character.target) {
      this.weapon.attack(this.character.target, this.character.distanceToTarget);
    }
  }

  destroy() {
    this.character.destroy();
    this.game.eventBus.unsubscribe("enemy_click", this.enemyClickListener, this);
  }

  get isDestroyed() {
    return !this.character || this.character.isDestroyed;
  }
}
