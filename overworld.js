class Overworld {
 constructor(config) {
   // Contenedor principal del juego y canvas de render.
   this.element = config.element;
   this.canvas = this.element.querySelector(".game-canvas");
   this.ctx = this.canvas.getContext("2d");
   this.map = null;
   // Estado global de historia para desbloquear eventos/escenas.
   this.storyFlags = {};
   // Audio de fondo del mapa actual.
   this.bgMusic = null;
   this.bgMusicStarted = false;
   this.currentMusicSrc = null;
   this.bgMusicManualLoopHandler = null;
  }

 initBackgroundMusic(src) {
   // Evita reiniciar pista si ya esta sonando la misma fuente.
   const requestedSrc = src || "";
   if (this.currentMusicSrc === requestedSrc && this.bgMusic) {
     return;
   }

    // Si cambia la pista, reinicia y limpia la anterior.
    if (this.bgMusic) {
     this.bgMusic.pause();
     this.bgMusic.currentTime = 0;
   }

   if (!requestedSrc) {
     this.bgMusic = null;
     this.currentMusicSrc = null;
     return;
   }

    // Crea y configura el nuevo audio de fondo.
    this.bgMusic = new Audio(requestedSrc);
   this.currentMusicSrc = requestedSrc;
   this.bgMusic.loop = requestedSrc !== "/imagenes/mapas/Hip%20Shop.mp3";
   this.bgMusic.volume = 0.6;
   this.bgMusic.preload = "auto";

    // Caso especial: pista con loop manual.
    if (!this.bgMusic.loop) {
     this.bgMusicManualLoopHandler = () => {
       this.bgMusic.currentTime = 0;
       this.bgMusic.play().catch(() => {});
     };
     this.bgMusic.addEventListener("ended", this.bgMusicManualLoopHandler);
   } else {
     this.bgMusicManualLoopHandler = null;
   }

   if (requestedSrc === "/imagenes/sans.mp3") {
     this.bgMusic.addEventListener("error", () => {
       // Fallback for current local file name
       this.bgMusic.src = "/imagenes/sans..mp3";
       this.bgMusic.load();
       this.bgMusic.play().catch(() => {});
     }, { once: true });
   }

    // Intenta reproducir (navegadores requieren gesto de usuario).
    const tryPlay = () => {
     this.bgMusic.play().then(() => {
       this.bgMusicStarted = true;
       window.removeEventListener("click", tryPlay);
       window.removeEventListener("keydown", tryPlay);
     }).catch(() => {});
   };

   if (this.bgMusicStarted) {
     this.bgMusic.play().catch(() => {});
   } else {
     tryPlay();
     window.addEventListener("click", tryPlay);
     window.addEventListener("keydown", tryPlay);
   }
  }

 pauseBackgroundMusic() {
   if (!this.bgMusic) return;
   this.bgMusic.pause();
 }

 resumeBackgroundMusic() {
   if (!this.bgMusic) return;
   this.bgMusic.play().catch(() => {});
 }

  startGameLoop() {
    // Bucle principal: actualiza estado y dibuja cada frame.
    const step = () => {
    
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Camara centrada en el heroe.
      const cameraPerson = this.map.gameObjects.hero;

      // Actualiza todos los objetos de juego.
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
      })

      // Dibuja capa inferior del mapa.
      this.map.drawLowerImage(this.ctx, cameraPerson);

      // Dibuja objetos ordenados por Y para simular profundidad.
      Object.values(this.map.gameObjects).sort((a,b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      })

      // Dibuja capa superior (por encima del jugador/NPCs).
      this.map.drawUpperImage(this.ctx, cameraPerson);
      
      requestAnimationFrame(() => {
        step();   
      })
    }
    step();
 }

 bindActionInput() {
   // Tecla Enter para hablar/interactuar.
   new KeyPressListener("Enter", () => {
    
     this.map.checkForActionCutscene()
   })
 }

 bindHeroPositionCheck() {
   // Cada vez que el heroe termina de caminar, revisa escenas por pisada.
   document.addEventListener("PersonWalkingComplete", e => {
     if (e.detail.whoId === "hero") {
       //Hero se mueve
       this.map.checkForFootstepCutscene()
     }
   })
 }

 startMap(mapConfig) {
   // Carga mapa, enlaza overworld, monta objetos e inicia musica.
   this.map = new OverworldMap(mapConfig);
  this.map.overworld = this;
  this.map.mountObjects();
  this.initBackgroundMusic(mapConfig.musicSrc || "");
 }

 init() {
   // Inicio del juego: mapa inicial, controles y loop de render.
   this.startMap(window.OverworldMaps.DemoRoom);

  this.bindActionInput();
  this.bindHeroPositionCheck();

  this.directionInput = new DirectionInput();
  this.directionInput.init();

  this.startGameLoop();




 }
}
