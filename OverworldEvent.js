class OverworldEvent {
  constructor({ map, event}) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })
    
    //poner  handler pa completar, then resolver the event
    
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //poner  handler pa completar, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)

  }

  textMessage(resolve) {

    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }
const message = new TextMessage({
text: this.event.text,
onComplete: () => resolve()

})
message.init(document.querySelector(".game-container"))
  }
//transicion cambio de mapa

 changeMap(resolve) {

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap( window.OverworldMaps[this.event.map] );
      resolve();

      sceneTransition.fadeOut();

    })
  }

  setFlag(resolve) {
    this.map.overworld.storyFlags[this.event.flag] = true;
    resolve();
  }

  screamer(resolve) {
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
    return new Promise(resolve => {
      this[this.event.type](resolve)      
    })
  }

}
