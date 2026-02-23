class Sprite{
constructor(config){
//imagenes para animacion//
this.image = new Image();
this.image.src= config.src;
this.image.onload = () => {

  this.isLoaded = true;

}
//sombra//
this.sombra = new Image();
this.useSombra= true;
if (this.useSombra){
    this.sombra.src="/imagenes/personajes/shadow.png"

}

//animacion config //
    this.animations = config.animations||{
    idleDown: [
        [0,0] 
    ],

}
this.currentAnimation= config.currentAnimation||"idleDown";
this.currentAnimationFrame=0;

// game object refe//

this.gameObject = config.gameObject;

}

draw(ctx) {
const x = this.gameObject.x -8;
const y = this.gameObject.y -8;
this.isSombraLoaded && ctx.drawImage(this.sombra,x,y)

this.isLoaded = true && ctx.drawImage(this.image,
0,0,
32,32,
x,y-8,
32,32
)
}
}