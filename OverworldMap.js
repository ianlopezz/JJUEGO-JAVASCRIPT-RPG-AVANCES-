class OverworldMap {
    constructor(config){
this.gameObjects = config.gameObjects;

this.lowerImage = new Image();
this.lowerImage.src = config.lowerSrc;
this.upperImage = new Image();
this.upperImage.src = config.upperSrc;
        
    }

    drawLowerImage(ctx){
ctx.drawImage(this.lowerImage,0 , 0)

    }
    drawUpperImage(ctx){
    ctx.drawImage(this.upperImage,0 , 0)

    }

}
window.OverworldMaps = {
    DemoRoom: {

lowerSrc: "/imagenes/mapas/DemoLower.png",
upperSrc: "/imagenes/mapas/DemoUpper.png",
gameObjects:{
hero: new GameObject({
x: utils.withGrid (5),
y: utils.withGrid (6),
  }),

// npc1: new GameObject({
// x:7,
// y:9,
// src:"/imagenes/personajes/npc1.png"

// })
}
     
},

Kitchen:{

lowerSrc: "/imagenes/mapas/KitchenLower.png",
upperSrc: "/imagenes/mapas/KitchenUpper.png",
gameObjects:{
hero: new GameObject({
x: 3,
y: 5,
  }),

npcA: new GameObject({
x:9,
y:6,
src:"/imagenes/personajes/npc2.png"

}),
npcB: new GameObject({
x:10,
y:8,
src:"/imagenes/personajes/npc3.png"

})
}
     
},

}