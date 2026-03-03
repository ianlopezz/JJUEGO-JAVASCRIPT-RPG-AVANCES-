class RevealingText {
  constructor(config) {
    // Nodo donde se renderiza el texto.
    this.element = config.element;
    // Texto completo a revelar.
    this.text = config.text;
    // Velocidad base entre letras (ms).
    this.speed = config.speed || 60;

    this.timeout = null;
    this.isDone = false;
  }

  revealOneCharacter(list) {
    // Revela el siguiente caracter y programa el siguiente paso.
    const next = list.splice(0,1)[0];
    next.span.classList.add("revealed");

    if (list.length > 0) {
      this.timeout = setTimeout(() => {
        this.revealOneCharacter(list)
      }, next.delayAfter)
    } else {
      this.isDone = true;
    }
  }

  warpToDone() {
    // Fuerza mostrar todo el mensaje de inmediato.
    clearTimeout(this.timeout);
    this.isDone = true;
    this.element.querySelectorAll("span").forEach(s => {
      s.classList.add("revealed");
    })
  }

  init() {
    // Crea un span por caracter para controlar efecto typewriter.
    let characters = [];
    this.text.split("").forEach(character => {

      
      let span = document.createElement("span");
      span.textContent = character;
      this.element.appendChild(span);

   
      characters.push({
        span,
        delayAfter: character === " " ? 0 : this.speed         
      })
    })

    this.revealOneCharacter(characters);

  }

}
