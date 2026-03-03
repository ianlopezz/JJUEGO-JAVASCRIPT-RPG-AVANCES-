class DirectionInput {
constructor() {
// Guarda el orden de teclas de movimiento activas (la primera tiene prioridad).
this.heldDirections = [];

// Mapeo de teclas fisicas a direcciones logicas del juego.
this.map={ //MOVIMIENTO !!!!
    "ArrowUp": "up",
      "KeyW": "up",
      "ArrowDown": "down",
      "KeyS": "down",
      "ArrowLeft": "left",
      "KeyA": "left",
      "ArrowRight": "right",
      "KeyD": "right",

                }
}
// Direccion actual prioritaria para mover al heroe.
get direction() {
    return this.heldDirections[0];
}



init() {
// Escucha pulsaciones para agregar direcciones activas.
    document.addEventListener("keydown", e => {
      const dir = this.map[e.code];
      if (dir && this.heldDirections.indexOf(dir) === -1) {
        this.heldDirections.unshift(dir);
   
      }
    });
    // Al soltar una tecla, elimina esa direccion de la cola.
    document.addEventListener("keyup", e => {
      const dir = this.map[e.code];
      const index = this.heldDirections.indexOf(dir);
      if (index > -1) {
        this.heldDirections.splice(index, 1);

      }
    })

  }

}
