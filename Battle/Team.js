class Team {
  constructor(config) {
    // Agrupa combatientes por bando (player/enemy).
    this.team = config.team;
    this.combatants = config.combatants;
  }
}
