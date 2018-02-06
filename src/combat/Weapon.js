class Weapon {
  constructor(game, config) {
    this.game = game;

    this.name = config.name;
    this.range = Object.assign({}, config.range);
    this.attackCooldown = config.attackCooldown;
    this.damagePerHit = config.damagePerHit;

    // state
    this.attackCooldownRemaining = 0;
  }

  canHit(range) {
    return range >= this.range.min && range <= this.range.max;
  }

  attack(character, range) {
    if (!character.isDead) {
      if (this.cooldownReady && this.canHit(range)) {
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
