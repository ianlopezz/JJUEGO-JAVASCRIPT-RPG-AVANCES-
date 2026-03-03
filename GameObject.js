class GameObject {
  constructor(config) {
    // ID unico asignado al montar el objeto dentro del mapa.
    this.id = null;
    // Indica si el objeto ya fue montado en la escena.
    this.isMounted = false;
    // Posicion del objeto en pixeles (base de grilla 16x16).
    this.x = config.x || 0;
    this.y = config.y || 0;
    // Direccion hacia la que mira.
    this.direction = config.direction || "down";
    // Sprite visual asociado al objeto.
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "/imagenes/personajes/hero.png",
    });

    // Patrón de comportamiento autonomo (NPCs).
    this.behaviorLoop = config.behaviorLoop || [];
    this.behaviorLoopIndex = 0;

    // Opciones de dialogo/interaccion del objeto.
    this.talking = config.talking || [];

  }

  mount(map) {
    console.log("cargando!")
    this.isMounted = true;
    // Reserva su tile para colision.
    map.addWall(this.x, this.y);

    // Inicia su comportamiento automatico tras montarse.
    setTimeout(() => {
      this.doBehaviorEvent(map);
    }, 10)
  }

  update() {
  }

  async doBehaviorEvent(map) { 

    // No ejecutar bucle si hay escena, no hay acciones o esta quieto esperando.
    if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
      return;
    }

    // Prepara el evento actual del bucle de comportamiento.
    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id;

    // Ejecuta el evento de overworld (caminar, esperar, etc).
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init(); 

    // Avanza al siguiente evento del bucle.
    this.behaviorLoopIndex += 1;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    } 

    // Repite el bucle de comportamiento.
    this.doBehaviorEvent(map);
    

  }


}
