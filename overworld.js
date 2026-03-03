class Overworld {
 constructor(config) {
   this.element = config.element;
   this.canvas = this.element.querySelector(".game-canvas");
   this.ctx = this.canvas.getContext("2d");
   this.map = null;
   this.storyFlags = {};
   this.bgMusic = null;
   this.bgMusicStarted = false;
   this.currentMusicSrc = null;
   this.bgMusicManualLoopHandler = null;
  }

 initBackgroundMusic(src) {
   const requestedSrc = src || "";
   if (this.currentMusicSrc === requestedSrc && this.bgMusic) {
     return;
   }

   if (this.bgMusic) {
     this.bgMusic.pause();
     this.bgMusic.currentTime = 0;
   }

   if (!requestedSrc) {
     this.bgMusic = null;
     this.currentMusicSrc = null;
     return;
   }

   this.bgMusic = new Audio(requestedSrc);
   this.currentMusicSrc = requestedSrc;
   this.bgMusic.loop = requestedSrc !== "/imagenes/mapas/Hip%20Shop.mp3";
   this.bgMusic.volume = 0.6;
   this.bgMusic.preload = "auto";

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
    const step = () => {
    
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //camara para el personaje
      const cameraPerson = this.map.gameObjects.hero;

      //actualizar obj
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
      })

      //Draw Lower layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      //Draw Game Objects
      Object.values(this.map.gameObjects).sort((a,b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      })

      //Draw Upper layer
      this.map.drawUpperImage(this.ctx, cameraPerson);
      
      requestAnimationFrame(() => {
        step();   
      })
    }
    step();
 }

 bindActionInput() {
   new KeyPressListener("Enter", () => {
    
     this.map.checkForActionCutscene()
   })
 }

 bindHeroPositionCheck() {
   document.addEventListener("PersonWalkingComplete", e => {
     if (e.detail.whoId === "hero") {
       //Hero se mueve
       this.map.checkForFootstepCutscene()
     }
   })
 }

 startMap(mapConfig) {
  this.map = new OverworldMap(mapConfig);
  this.map.overworld = this;
  this.map.mountObjects();
  this.initBackgroundMusic(mapConfig.musicSrc || "");
 }

 init() {
  this.startMap(window.OverworldMaps.DemoRoom);

  this.bindActionInput();
  this.bindHeroPositionCheck();

  this.directionInput = new DirectionInput();
  this.directionInput.init();

  this.startGameLoop();




 }
}
