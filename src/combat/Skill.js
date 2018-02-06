class Skill {
  constructor(game, config) {
    this.game = game;

    this.name = config.name;
    this.range = Object.assign({}, config.range);
    this.cooldown = config.cooldown;
    this.damagePerHit = config.damagePerHit;
    this.iconConfig = config.icon;

    // state
    this.cooldownRemaining = 0;
  }

  canHit(range) {
    return range >= this.range.min && range <= this.range.max;
  }

  useOn(character) {
    if (!character.isDead) {
      if (this.cooldownReady) {
        character.applyDamage(this.damagePerHit);
        this.cooldownRemaining = this.cooldown;
      }
    }
  }

  get cooldownReady() {
    return this.cooldownRemaining <= 0;
  }

  update() {
    this.cooldownRemaining -= Math.min(
      this.game.phaserGame.time.physicsElapsedMS,
      this.cooldownRemaining);
  }

  publishIcon(eventName) {
    this.game.eventBus.publish(
      eventName,
      {
        newSkill: {
          spriteName: this.iconConfig.spriteName,
          frame: this.iconConfig.frame
        }
      });
  }

}
