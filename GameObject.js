class GameObject {
  constructor(config) {
    this.id= null;
      this.isMounted = false;
this.x= config.x||0;
this.y= config.y||0;
this.direction = config.direction|| "down";
this.sprite = new Sprite({
gameObject: this,
src: config.src || "/imagenes/personajes/hero.png"
});
 
 }
 mount(map) {
    console.log("mounting!")
    this.isMounted = true;
    map.addWall(this.x, this.y);


    setTimeout(() => {
     this.doBehaviorEvent(map) 
    }, 10);
 }
update(){

}
async doBehaviorEvent(map) { 

   //evento
    if (map.isCutscenePlaying || this.behaviorLoop.length === 0) {
      return;
    }

    //info del evento
    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id;

    //enveto config
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init(); 

    //setting next evento 
    this.behaviorLoopIndex += 1;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    } 

    //again otra ve 
    this.doBehaviorEvent(map);
    

  }

}
