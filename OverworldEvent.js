class OverworldEvent {
  constructor({ map, event}) {
    // Referencia al mapa actual y configuracion del evento a ejecutar.
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    // Ordena a un personaje quedarse quieto mirando una direccion.
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })
    
    // Espera la confirmacion de fin para resolver la promesa del evento.
    
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    // Ordena caminar un tile; retry intenta de nuevo si hay bloqueo temporal.
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    // Espera evento de fin de movimiento para continuar la secuencia.
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)

  }

  textMessage(resolve) {
    // Muestra cuadro de texto y continua al cerrar.

    if (this.event.faceHero) {
      // Hace que quien habla mire al heroe.
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }
const message = new TextMessage({
text: this.event.text,
onComplete: () => resolve()

})
message.init(document.querySelector(".game-container"))
  }
// Evento de transicion visual y cambio de mapa.

 changeMap(resolve) {

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap( window.OverworldMaps[this.event.map] );
      resolve();

      sceneTransition.fadeOut();

    })
  }

  setFlag(resolve) {
    // Marca una bandera de historia para desbloquear contenido.
    this.map.overworld.storyFlags[this.event.flag] = true;
    resolve();
  }

  screamer(resolve) {
    // Reproduce jumpscare en overlay. Si ya esta marcado, no repite.
    if (this.event.setFlag && this.map.overworld.storyFlags[this.event.setFlag]) {
      resolve();
      return;
    }

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "black";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const video = document.createElement("video");
    video.src = this.event.videoSrc || "";
    video.autoplay = true;
    video.playsInline = true;
    video.controls = false;
    video.style.width = "100vw";
    video.style.height = "100vh";
    video.style.objectFit = "cover";

    // Limpieza comun al terminar/error del video.
    const cleanup = () => {
      video.pause();
      overlay.remove();
      if (this.event.setFlag) {
        this.map.overworld.storyFlags[this.event.setFlag] = true;
      }
      resolve();
    };

    video.addEventListener("ended", cleanup, { once: true });
    video.addEventListener("error", cleanup, { once: true });

    overlay.appendChild(video);
    document.body.appendChild(overlay);

    video.play().catch(cleanup);
  }

 battle(resolve) {
  // Inicia combate; al terminar, retorna control al overworld.
  this.map.overworld.pauseBackgroundMusic();

  const battle = new Battle({
    enemyId: this.event.enemyId,
    onComplete: (result) => {
      if (result === "win" && this.event.winFlag) {
        this.map.overworld.storyFlags[this.event.winFlag] = true;
      }
      this.map.overworld.resumeBackgroundMusic();
      resolve();
    }
  });

  battle.init(document.querySelector(".game-container"));
}

  init() {
    // Dispatcher dinamico: ejecuta metodo segun event.type.
    return new Promise(resolve => {
      this[this.event.type](resolve)      
    })
  }

}
