class TextMessage {
  constructor({ text, onComplete }) {
    // Contenido del mensaje y callback al cerrarlo.
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    // Crea contenedor del cuadro de dialogo.
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");

    this.element.innerHTML = (`
      <p class="TextMessage_p"></p>
      <button class="TextMessage_button">Next</button>
    `)

    // Inicializa efecto de texto progresivo.
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".TextMessage_p"),
      text: this.text
    })

    // Click en boton: cerrar/avanzar mensaje.
    this.element.querySelector("button").addEventListener("click", () => {
      //Close the text message
      this.done();
    });

    // Enter tambien avanza/cierra el mensaje.
    this.actionListener = new KeyPressListener("Enter", () => {
      this.done();
    })

  }

  done() {
    // Si ya termino el efecto, cierra; si no, revela todo al instante.

    if (this.revealingText.isDone) {
      this.element.remove();
      this.actionListener.unbind();
      this.onComplete();
    } else {
      this.revealingText.warpToDone();
    }
  }

  init(container) {
    // Inserta mensaje en pantalla e inicia la animacion de texto.
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();
  }

}
