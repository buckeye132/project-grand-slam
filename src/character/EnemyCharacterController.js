const ENEMY_FACTION = "enemy";

class EnemyCharacterController {
  constructor(x, y, enemyConfig, game, characterId) {
    // bind event Listeners
    this.handleCharacterStatusBroadcast = this.handleCharacterStatusBroadcast
      .bind(this);

    this.game = game;
    this.characterId = characterId;

    // store config data
    this.desiredRange = enemyConfig.desiredRange;
    this.agroRange = enemyConfig.agroRange;
    this.chaseDistance = enemyConfig.chaseDistance;
    this.initialPosition = { x: x, y: y };

    // create a Character to control
    console.log("enemy config: " + JSON.stringify(enemyConfig));
    this.character = new game.factory.Character(this.game,
      enemyConfig.characterConfig,
      this.characterId,
      false,
      false,
      ENEMY_FACTION);
    this.character.position = { x: x, y: y };

    /*if (config.weaponName) {
      this.weapon = this.game.weaponManager.createWeapon(config.weaponName);
    }*/

    // listen for enemy_click events to control highlighting
    //this.game.eventBus.subscribe("enemy_click", this.enemyClickListener, this);


    // listen for character status broadcasts
    this.game.eventBus.subscribeNetwork("character_status_broadcast",
      this.handleCharacterStatusBroadcast);
  }

  /* Input Callbacks */

  /* Event Bus Listeners */
  /*enemyClickListener(data) {
    if (this.isDestroyed) {
      return;
    }

    if (data.enemyController == this) {
      this.character.isHighlighted = true;
    } else {
      this.character.isHighlighted = false;
    }
  }*/

  handleCharacterStatusBroadcast(data) {
    // skip processing if we're dead
    if (this.isDestroyed) return;

    // skip processing if we already have a target
    if (this.character.target) return;

    for (var characterId in data) {
      var characterStatus = data[characterId];

      // ignore status for this characters in the same faction
      if (characterStatus.faction === this.character.faction) continue;

      // now check if this chacter is within our agro range
      // quick exit
      if (Math.abs(characterStatus.position.x - this.character.position.x) > this.agroRange ||
          Math.abs(characterStatus.position.y - this.character.position.y) > this.agroRange) {
        return;
      }

      // deeper distance check
      var targetPosition = characterStatus.position;
      var distanceToTarget = this.character.distanceTo(targetPosition);

      if (distanceToTarget <= this.agroRange) {
        // check that the potential target character can be reached
        var delta = {
          x: Math.abs(this.initialPosition.x - targetPosition.x),
          y: Math.abs(this.initialPosition.y - targetPosition.y)
        };
        var targetDistanceFromHome = Math.sqrt(
          Math.pow(delta.x, 2) + Math.pow(delta.y, 2));

        if (targetDistanceFromHome < this.chaseDistance + this.desiredRange) {
          // we're in range of a target, get 'm
          this.character.target = this.game.characterManager.findCharacterById(
              characterId);
          if (this.character.target) {
            console.log("no local copy of target found");
          } else {
            break;
          }
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
    var distanceFromHome = this.character.distanceTo(this.initialPosition);
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

    // decide direction to move
    var deltaX = targetPosition.x - this.character.position.x;
    var deltaY = targetPosition.y - this.character.position.y;

    var distance = this.character.distanceTo(targetPosition);

    if (distance > targetRange) {
      this.character.setMove(deltaX, deltaY);
    } else {
      this.character.setMove(0, 0);
    }

    // perform character update()
    this.character.update();
    //this.weapon.update();

    // try attacking
    /*if (this.character.target) {
      this.weapon.attack(this.character.target, this.character.distanceToTarget);
    }*/
  }

  destroy() {
    this.game.eventBus.unsubscribeNetwork("character_status_broadcast",
      this.handleCharacterStatusBroadcast);
    this.character.destroy();
  }

  get isDestroyed() {
    return !this.character || this.character.isDestroyed;
  }
}

if (typeof window === 'undefined') {
  module.exports = EnemyCharacterController;
}
