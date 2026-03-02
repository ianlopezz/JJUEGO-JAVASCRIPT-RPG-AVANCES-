class Battle {
constructor(){


}
createElement(){
this.createElement= document.createElement("div");
this.element.classList.add("Battle");
this.element.innerHTML= (`
    '<img src="$'/imagenes/personajes/hero.png'}" alt="hero" />
    </div>
       '<img src="$'/imagenes/personajes/npc3.png'}" alt="Enemy" />
    </div>
    `)

}
init(container){
this.createElement();
container.appendChild(this.element);
}
}