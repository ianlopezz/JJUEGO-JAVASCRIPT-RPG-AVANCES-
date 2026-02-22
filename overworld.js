class Overworld{
 constructor(config) {

 this.element = config.element;
 this.canvas = this.element.querySelector(".game-canvas");
 this.ctx = this.canvas.getContext("2d");

 }   
 init(){
  const image = new Image();
   image.onload = () => {
this.ctx.drawImage(image,0,0)
   };
   image.src="imagenes/mapas/DemoLower.png";

const x = 5;
const y = 6;

   const sombra = new Image();
   sombra.onload = () => {
this.ctx.drawImage(
   sombra,
   0, //izquierda
   0,// arriba
   32, //ancho
   32,//alto
   x*16 - 8 ,
   y*16-18,
   32,
   32,
   
   )
   
}
sombra.src="imagenes/personajes/shadow.png"


   const hero = new Image();
   hero.onload = () => {
this.ctx.drawImage(
   hero,
   0, //izquierda
   0,// arriba
   32, //ancho
   32,//alto
   x*16 - 8 ,
   y*16-18,
   32,
   32,
   
   )

}
hero.src="imagenes/personajes/hero.png"

   }

 }

 

 
