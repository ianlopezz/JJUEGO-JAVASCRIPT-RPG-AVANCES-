class SceneTransition {
  constructor() {
    // Overlay DOM para animacion de transicion.
    this.element = null;
  }
  createElement() {
    // Crea el nodo visual usado para fade in/out.
    this.element = document.createElement("div");
    this.element.classList.add("SceneTransition");
  }

  fadeOut() {
    // Ejecuta fade-out y elimina el nodo al terminar.
    this.element.classList.add("fade-out");
    this.element.addEventListener("animationend", () => {
      this.element.remove();
    }, { once: true })
  }

  init(container, callback) {
    // Inserta transicion y llama callback al finalizar el fade-in.
    this.createElement();
    container.appendChild(this.element);

    this.element.addEventListener("animationend", () => {
      callback();
    }, { once: true })

  }
}
