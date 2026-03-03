class Combatant {
  constructor(config) {
    // Datos base de cada combatiente.
    this.name = config.name;
    this.hp = config.hp;
    this.maxHp = config.maxHp;
    this.isPlayer = config.isPlayer;
    this.src = config.src;
    this.isDead = false;
  }

  takeDamage(amount) {
    // Aplica dano y marca KO si llega a 0 HP.
    this.hp -= amount;

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
  }
}
