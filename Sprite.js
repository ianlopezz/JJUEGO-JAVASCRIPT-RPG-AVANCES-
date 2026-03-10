class Sprite {
  constructor(config) {

    // Carga imagen principal del personaje/objeto.
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    }

    // Sombra debajo del sprite para mejorar profundidad visual.
    this.shadow = new Image();
    this.useShadow = true; //config.useShadow || false
    if (this.useShadow) {
      this.shadow.src = "/imagenes/personajes/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    }

    // Tabla de animaciones por estado y direccion.
    this.animations = config.animations || {
      "idle-down" : [ [0,0] ],
      "idle-right": [ [0,1] ],
      "idle-up"   : [ [0,2] ],
      "idle-left" : [ [0,3] ],
      "walk-down" : [ [1,0],[0,0],[3,0],[0,0], ],
      "walk-right": [ [1,1],[0,1],[3,1],[0,1], ],
      "walk-up"   : [ [1,2],[0,2],[3,2],[0,2], ],
      "walk-left" : [ [1,3],[0,3],[3,3],[0,3], ]
    }
    this.currentAnimation = "idle-right"; // config.currentAnimation || "idle-down";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 16;
    this.animationFrameProgress = this.animationFrameLimit;
    

    //señala GameObject
    // Referencia al GameObject dueño del sprite (posicion/estado).
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame]
  }

  setAnimation(key) {
    // Si cambia la animacion, reinicia frame y contador.
    if (this.currentAnimation !== key) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    // Cuenta frames hasta avanzar al siguiente cuadro de animacion.
    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    // Reinicia contador y avanza al siguiente frame.
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame += 1;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0
    }


  }
  

  draw(ctx, cameraPerson) {
    // Convierte posicion del mundo a pantalla segun camara.
    const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
    const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;

    // Dibuja sombra y luego el sprite recortado del spritesheet.
    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);


    const [frameX, frameY] = this.frame;

    this.isLoaded && ctx.drawImage(this.image,
      frameX * 32, frameY * 32,
      32,32,
      x,y,
      32,32
    )

    this.updateAnimationProgress();
  }

}
