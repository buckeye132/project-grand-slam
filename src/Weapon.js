const MIN_RANGE = 0;
const MAX_RANGE = 80;
const ATTACK_COOLDOWN = 1000;
const DAMAGE_PER_HIT = 20;

class Weapon {
  constructor(game) {
    this.game = game;
    this.range = {
      min: MIN_RANGE,
      max: MAX_RANGE
    };
    this.attackCooldown = ATTACK_COOLDOWN;
    this.damagePerHit = DAMAGE_PER_HIT;
    this.attackCooldownRemaining = 0;
  }

  canHit(range) {
    return range >= MIN_RANGE && range <= MAX_RANGE;
  }

  attack(character) {
    if (!character.isDead) {
      if (this.cooldownReady) {
        character.applyDamage(this.damagePerHit);
        this.attackCooldownRemaining = this.attackCooldown;
      }
    }
  }

  get cooldownReady() {
    return this.attackCooldownRemaining <= 0;
  }

  update() {
    this.attackCooldownRemaining -= Math.min(
      this.game.phaserGame.time.physicsElapsedMS,
      this.attackCooldownRemaining);
  }

}
