class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.actionSpaces = config.actionSpaces || {};
    this.walls = config.walls || {};
    this.mapSize = config.mapSize || null;
    this.wallRects = config.wallRects || [];
    this.walkableBounds = config.walkableBounds || null;

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.applyWallRects();
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    if (this.isOutOfBounds(x, y)) {
      return true;
    }
    return this.walls[`${x},${y}`] || false;
  }

  isOutOfBounds(x, y) {
    const tileBounds = this.getWalkableTileBounds();
    if (!tileBounds) {
      return false;
    }

    const minX = tileBounds.minX * 16;
    const minY = tileBounds.minY * 16;
    const maxX = tileBounds.maxX * 16;
    const maxY = tileBounds.maxY * 16;
    return x < minX || y < minY || x > maxX || y > maxY;
  }

  getWalkableTileBounds() {
    if (this.walkableBounds) {
      return this.walkableBounds;
    }

    if (this.mapSize && this.mapSize.width && this.mapSize.height) {
      return {
        minX: 0,
        minY: 0,
        maxX: this.mapSize.width - 1,
        maxY: this.mapSize.height - 1
      };
    }

    const width = this.lowerImage.naturalWidth || this.lowerImage.width;
    const height = this.lowerImage.naturalHeight || this.lowerImage.height;
    if (!width || !height) {
      return null;
    }

    return {
      minX: 0,
      minY: 0,
      maxX: Math.floor(width / 16) - 1,
      maxY: Math.floor(height / 16) - 1
    };
  }

  applyWallRects() {
    this.wallRects.forEach(rect => {
      const x1 = Math.min(rect.x1, rect.x2);
      const x2 = Math.max(rect.x1, rect.x2);
      const y1 = Math.min(rect.y1, rect.y2);
      const y2 = Math.max(rect.y1, rect.y2);

      for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
          this.walls[utils.asGridCoord(x, y)] = true;
        }
      }
    });
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //cargando data
      object.mount(this);

    })
  }
//evento 
  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //reset npc
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      const scenario = match.talking.find(option => {
        if (option.requiresFlag && !this.overworld.storyFlags[option.requiresFlag]) {
          return false;
        }
        if (option.unlessFlag && this.overworld.storyFlags[option.unlessFlag]) {
          return false;
        }
        return true;
      });

      if (scenario && scenario.events && scenario.events.length) {
        this.startCutscene(scenario.events);
      }
      return;
    }

    const actionScenarios = this.actionSpaces[`${nextCoords.x},${nextCoords.y}`];
    if (!this.isCutscenePlaying && actionScenarios) {
      const scenario = actionScenarios.find(option => {
        if (option.requiresFlag && !this.overworld.storyFlags[option.requiresFlag]) {
          return false;
        }
        if (option.unlessFlag && this.overworld.storyFlags[option.unlessFlag]) {
          return false;
        }
        return true;
      });

      if (scenario && scenario.events && scenario.events.length) {
        this.startCutscene(scenario.events);
      }
    }
  }
// cinematica mov segun pas
  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const scenarios = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && scenarios) {
      const match = scenarios.find(scenario => {
        if (scenario.requiresFlag && !this.overworld.storyFlags[scenario.requiresFlag]) {
          return false;
        }
        if (scenario.unlessFlag && this.overworld.storyFlags[scenario.unlessFlag]) {
          return false;
        }
        return true;
      });

      if (match && match.events && match.events.length) {
        this.startCutscene(match.events);
      }
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}

window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: "/imagenes/mapas/DemoLower.png",
    upperSrc: "/imagenes/mapas/DemoUpper.png",
    musicSrc: "/imagenes/sans.mp3",
    mapSize: { width: 12, height: 12 },
    walkableBounds: { minX: 1, minY: 3, maxX: 10, maxY: 10 },
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/imagenes/personajes/erio.png",
        talking: [
          {
            unlessFlag: "defeatedErio2",
            events: [
              { type: "textMessage", text: "preparate para morir inutil!" },
              { type: "battle", enemyId: "erio", winFlag: "defeatedErio2" },
              { type: "textMessage", text: "que....................................................................................." }
            ]
          },
          {
            requiresFlag: "defeatedErio2",
            events: [
              { type: "textMessage", text: "Erio: literalmente me has ganado con ayuda del creador del juego, eres un maldito, fuera de mi vista" }
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/imagenes/personajes/npc2.png",
      }),
    },
    walls: {
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,4)]: [
        {
          unlessFlag: "defeatedErio2",
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"Hey!."},
            { type: "textMessage", text:"No puedes pasar al almacen."},
            { type: "textMessage", text:"Porque no?."},
            { type: "textMessage", text:"porque ese de abajo es mi jefe."},
            { type: "textMessage", text:"y para serte sincero no me paga lo suficiente."},
            { type: "textMessage", text:"para aguantar niÃ±os jugando en su restaurante."},
            { type: "textMessage", text:"hagamos un trato."},
            { type: "textMessage", text:"Si derrotas a Erio, te dejo entrar."},
            { type: "textMessage", text:"tal vez encuentres algo interesante alli adentro si presionas ENTER"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        },
        {
          requiresFlag: "defeatedErio2",
          unlessFlag: "npcBGateOpened",
          events: [
            { who: "npcB", type: "stand",  direction: "left", time: 300 },
            { type: "textMessage", text:"Cumpliste la mision. Puedes pasar al almacen." },
            { type: "screamer" },
            { type: "setFlag", flag: "npcBGateOpened" }
          ]
        }
      ],
      [utils.asGridCoord(7,3)]: [
        {
          requiresFlag: "defeatedErio2",
          unlessFlag: "visitedAlmacen",
          events: [
            { type: "textMessage", text:"Entraste al almacen." },
            { type: "setFlag", flag: "visitedAlmacen" }
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          unlessFlag: "defeatedErio2",
          events: [
            { type: "textMessage", text:"Erio: Detente inutil, a la cocina solo entra el personal autorizado Y TU NO LO ERES.", faceHero:"npcA" },
            { who: "hero", type: "walk",  direction: "up" }
          ]
        },
        {
          requiresFlag: "defeatedErio2",
          events: [
            { type: "changeMap", map: "Kitchen" }
          ]
        }
      ]
    },
    actionSpaces: {
      [utils.asGridCoord(7,2)]: [
        {
          requiresFlag: "visitedAlmacen",
          unlessFlag: "foxyScreamerPlayed",
          events: [
            { type: "screamer", videoSrc: "/imagenes/foxy jumpscare  fnaf 2.mp4", setFlag: "foxyScreamerPlayed" }
          ]
        }
      ]
    }
  },
  Kitchen: {
    lowerSrc: "imagenes/mapas/KitchenLower.png",
    upperSrc: "/imagenes/mapas/KitchenUpper.png",
    musicSrc: "/imagenes/mapas/Hip%20Shop.mp3",
    mapSize: { width: 14, height: 12 },
    walkableBounds: { minX: 1, minY: 4, maxX: 12, maxY: 10 },
    walls: {
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,10)] : true,
      [utils.asGridCoord(12,10)] : true,
    },
    wallRects: [
      { x1: 1, y1: 4, x2: 3, y2: 4 },
      { x1: 5, y1: 4, x2: 10, y2: 4 },
      { x1: 11, y1: 4, x2: 11, y2: 5 },
      { x1: 11, y1: 5, x2: 12, y2: 5 },
      { x1: 1, y1: 6, x2: 1, y2: 8 },
      { x1: 5, y1: 7, x2: 7, y2: 7 },
      { x1: 9, y1: 7, x2: 10, y2: 7 },
      { x1: 1, y1: 9, x2: 2, y2: 9 },
      { x1: 9, y1: 9, x2: 10, y2: 9 }
    ],
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/imagenes/personajes/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "y tu quien porras eres? ", faceHero:"npcB" },
              { type: "textMessage", text: " derrotaste a mi jefe????", faceHero:"npcB" },
              { type: "textMessage", text: " ya veo, eres uno de esos...", faceHero:"npcB" },
              { type: "textMessage", text: " pues ya te digo que aqui no hay nada que hacer", faceHero:"npcB" },
              { type: "textMessage", text: "hoy es vaga y nadie quiere trabajar ", faceHero:"npcB" },
              { type: "textMessage", text: "asi que si quieres una pizza haztela tu mismo que aqui nadie es tu empleado ", faceHero:"npcB" },
            ]
          }
        ]
        
      })
      
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", map: "DemoRoom" }
          ]
        }
      ]
    },
    actionSpaces: {
      [utils.asGridCoord(1,6)]: [
        {
          events: [
            { type: "textMessage", text: "te comes la pizza por la que tanto luchaste" },
            { type: "textMessage", text: "una pena que este fría y parece que este hecha con carton y pegamento en lugar de queso" },
            { type: "textMessage", text: "te arrepientes tanto de haber venido a este lugar.." }
          ]
        }
      ],
      [utils.asGridCoord(1,7)]: [
        {
          events: [
            { type: "textMessage", text: "te comes la pizza por la que tanto luchaste" },
            { type: "textMessage", text: "una pena que este fría y parece que este hecha con carton y pegamento en lugar de queso" },
            { type: "textMessage", text: "te arrepientes tanto de haber venido a este lugar.." }
          ]
        }
      ],
      [utils.asGridCoord(1,8)]: [
        {
          events: [
            { type: "textMessage", text: "te comes la pizza por la que tanto luchaste" },
            { type: "textMessage", text: "una pena que este fría y parece que este hecha con carton y pegamento en lugar de queso" },
            { type: "textMessage", text: "te arrepientes tanto de haber venido a este lugar.." }
          ]
        }
      ]
    }
    
  },
}

