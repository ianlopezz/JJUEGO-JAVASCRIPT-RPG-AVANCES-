const utils = {
  withGrid(n) {
    // Convierte unidades de tile a pixeles (tile size = 16).
    return n * 16; // hacer que las coords de casilla se multipliquen x 16 y tengan valores fijos
  
  },
  // Convierte coordenadas de tile (x,y) a string "x,y" en pixeles.
  asGridCoord(x,y) {
    return `${x*16},${y*16}`
  },
  nextPosition(initialX, initialY, direction) {
    // Calcula la siguiente posicion en pixeles segun direccion.
    let x = initialX;
    let y = initialY;
    const size = 16;
    if (direction === "left") { 
      x -= size;
    } else if (direction === "right") {
      x += size;
    } else if (direction === "up") {
      y -= size;
    } else if (direction === "down") {
      y += size;
    }
    return {x,y};
    
  },
// Devuelve la direccion opuesta para orientar NPCs/dialogos.
  oppositeDirection(direction) {
    if (direction === "left") { return "right" }
    if (direction === "right") { return "left" }
    if (direction === "up") { return "down" }
    return "up"
  },
    emitEvent(name, detail) {
    // Helper para emitir eventos custom y comunicar sistemas del juego.
    const event = new CustomEvent(name, {
      detail
    });
    document.dispatchEvent(event);
  }
  
}
