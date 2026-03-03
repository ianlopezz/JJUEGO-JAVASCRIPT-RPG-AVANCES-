class Combatant {
  constructor(config) {
    this.name = config.name;
    this.hp = config.hp;
    this.maxHp = config.maxHp;
    this.isPlayer = config.isPlayer;
    this.src = config.src;
    this.isDead = false;
  }

  takeDamage(amount) {
    this.hp -= amount;

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
  }
}