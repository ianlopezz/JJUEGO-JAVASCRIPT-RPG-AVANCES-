class Person extends GameObject {
  constructor(config) {
    super(config);
    // Cuantos pixeles faltan para completar el paso actual (1 tile = 16px).
    this.movingProgressRemaining = 0;
    // Estado de espera inmovil durante accion "stand".
    this.isStanding = false;

    // Indica si este personaje lo controla el jugador.
    this.isPlayerControlled = config.isPlayerControlled || false;

    // Mapea direccion a propiedad (x/y) y delta por frame.
    this.directionUpdate = {
      "up": ["y", -1],
      "down": ["y", 1],
      "left": ["x", -1],
      "right": ["x", 1],
    }
  }

  update(state) {
    // Si esta en movimiento, avanza frame a frame.
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      // Si es el heroe y no hay cinemática, toma input para caminar.
      if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow
        })
      }
      this.updateSprite(state);
    }
  }

  startBehavior(state, behavior) {
    // Actualiza direccion del personaje.
    this.direction = behavior.direction;
    
    if (behavior.type === "walk") {
      // Bloquea movimiento si el proximo tile esta ocupado.
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

        behavior.retry && setTimeout(() => {
          this.startBehavior(state, behavior)
        }, 10);

        return;
      }

      // Reserva la nueva pared de colision y arranca desplazamiento.
      state.map.moveWall(this.x, this.y, this.direction);
      this.movingProgressRemaining = 16;
      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      // Espera cierto tiempo y emite evento de fin de espera.
      this.isStanding = true;
      setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id
        })
        this.isStanding = false;
      }, behavior.time)
    }

  }

  updatePosition() {
      // Avanza 1 pixel en la direccion actual por cada frame.
      const [property, change] = this.directionUpdate[this.direction];
      this[property] += change;
      this.movingProgressRemaining -= 1;

      if (this.movingProgressRemaining === 0) {
        // Al terminar el tile, notifica para disparar escenas/eventos.
        utils.emitEvent("PersonWalkingComplete", {
          whoId: this.id
        })

      }
  }

  updateSprite() {
    // Selecciona animacion de caminar o idle segun estado.
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-"+this.direction);
      return;
    }
    this.sprite.setAnimation("idle-"+this.direction);    
  }

}
