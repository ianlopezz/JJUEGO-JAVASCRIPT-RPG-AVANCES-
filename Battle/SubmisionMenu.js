class SubmissionMenu {
  constructor({ combatant, onComplete }) {
    this.combatant = combatant;
    this.onComplete = onComplete;
  }

  init(container) {
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
    this.element.remove();
  }
}