class SubmissionMenu {
  constructor({ combatant, onComplete }) {
    // Menu de acciones del turno del jugador.
    this.combatant = combatant;
    this.onComplete = onComplete;
  }

  init(container) {
    // Renderiza acciones disponibles en la UI de batalla.
    this.element = document.createElement("div");
    this.element.classList.add("SubmissionMenu");

    this.element.innerHTML = `
      <button data-action="attack">Attack</button>
    `;

    this.element.querySelector("button").addEventListener("click", () => {
      this.close();
      this.onComplete("attack");
    });

    container.appendChild(this.element);
  }

  close() {
    // Elimina el menu al seleccionar accion.
    this.element.remove();
  }
}
