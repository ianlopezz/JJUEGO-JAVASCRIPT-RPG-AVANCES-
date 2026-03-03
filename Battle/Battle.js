class Battle {

  constructor(config) {
    // Configuracion general de combate y callbacks.
    this.enemyId = config.enemyId;
    this.activeCombatants = {};
    this.onComplete = config.onComplete || (() => {});
    this.turnDelay = 2000;
    this.impactDelay = 260;
    this.victoryDelay = 13000;
    // Audio de impacto, victoria y musica de batalla.
    this.hitSound = new Audio("/Battle/Bonk%20Sound%20Effect.mp3");
    this.hitSound.preload = "auto";
    this.victorySound = new Audio("/Battle/victoria.mp3");
    this.victorySound.preload = "auto";
    this.battleMusic = new Audio(
      "/Battle/" + encodeURIComponent("12. Physical Challenge (DELTARUNE Chapter 3+4 Soundtrack) - Toby Fox.mp3")
    );
    this.battleMusic.loop = true;
    this.battleMusic.volume = 0.6;
    this.battleMusic.preload = "auto";
    // Estado para detectar combinacion de giro (skip secreto).
    this.spinProgress = { cwIndex: 0, ccwIndex: 0, cwCount: 0, ccwCount: 0 };
    this.hasSkipped = false;
    this.immortalPhaseTriggered = false;
    this.superPowerUnlocked = false;
    this.boundSpinHandler = this.handleSpinInput.bind(this);
  }

init(container) {
  // Arranque del combate: musica, inputs, UI y primer turno.
  this.container = container;
  this.startBattleMusic();
  document.addEventListener("keydown", this.boundSpinHandler);

  this.createTeams();
  this.createElement();
  this.startTurn();
}

startTurn() {
  // Turno del jugador: limpia UI y abre menu de accion.
  const battleUI = this.element.querySelector(".battle-ui");
  battleUI.innerHTML = "";
  this.clearOverlayMessage();

  const menu = new SubmissionMenu({
    combatant: this.activeCombatants.player,
    onComplete: (action) => {
      if (action === "attack") {
        // Ataque del jugador: animacion, dano y validacion de estados.
        this.showMessage("Hero attacks!");
        this.playAttackAnimation("player", "enemy");

        setTimeout(() => {
          this.activeCombatants.enemy.takeDamage(20);
          this.playHitSound();

          if (this.activeCombatants.enemy.hp <= 1 && !this.immortalPhaseTriggered) {
            this.activeCombatants.enemy.hp = 1;
            this.activeCombatants.enemy.isDead = false;
            this.updateHP();
            this.triggerImmortalPhase();
            return;
          }

          this.updateHP();

          if (!this.activeCombatants.enemy.isDead) {
            setTimeout(() => this.enemyTurn(), this.turnDelay - this.impactDelay);
          } else {
            this.stopBattleMusic();
            this.playVictorySound();
            this.showMessage("You won!");
            setTimeout(() => this.finish("win"), this.victoryDelay);
          }
        }, this.impactDelay);
      }
    }
  });
  menu.init(battleUI);
}

enemyTurn() {
  // Turno del enemigo.
  this.showMessage("Erio attacks!");
  this.playAttackAnimation("enemy", "player");

  setTimeout(() => {
    this.activeCombatants.player.takeDamage(12);
    this.playHitSound();
    this.updateHP();

    if (!this.activeCombatants.player.isDead) {
      this.startTurn();
    } else {
      this.showMessage("You were defeated.");
      setTimeout(() => this.finish("lose"), this.turnDelay);
    }
  }, this.impactDelay);
}

finish(result = "quit") {
  // Cierra combate, limpia recursos y devuelve resultado al overworld.
  document.removeEventListener("keydown", this.boundSpinHandler);
  this.stopBattleMusic();
  this.victorySound.pause();
  this.victorySound.currentTime = 0;
  this.element.remove();
  this.onComplete(result);
}

handleSpinInput(e) {
  // Detecta secuencias de flechas para activar atajo secreto.
  if (this.hasSkipped || !this.element) {
    return;
  }

  const key = e.key;
  const cw = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
  const ccw = ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"];

  if (!cw.includes(key)) {
    return;
  }

  // Seguimiento en sentido horario.
  if (key === cw[this.spinProgress.cwIndex]) {
    this.spinProgress.cwIndex = (this.spinProgress.cwIndex + 1) % 4;
    if (this.spinProgress.cwIndex === 0) {
      this.spinProgress.cwCount += 1;
    }
  } else {
    this.spinProgress.cwIndex = key === cw[0] ? 1 : 0;
    this.spinProgress.cwCount = 0;
  }

  // Seguimiento en sentido antihorario.
  if (key === ccw[this.spinProgress.ccwIndex]) {
    this.spinProgress.ccwIndex = (this.spinProgress.ccwIndex + 1) % 4;
    if (this.spinProgress.ccwIndex === 0) {
      this.spinProgress.ccwCount += 1;
    }
  } else {
    this.spinProgress.ccwIndex = key === ccw[0] ? 1 : 0;
    this.spinProgress.ccwCount = 0;
  }

  if (this.spinProgress.cwCount >= 3 || this.spinProgress.ccwCount >= 3) {
    this.skipBattle();
  }
}

skipBattle() {
  // Salta la batalla tras combo secreto de giros.
  this.hasSkipped = true;
  const battleUI = this.element.querySelector(".battle-ui");
  battleUI.innerHTML = "";

  const lines = [
    "COMO HAS HECHO ESO?",
    "has interrumpido nuestra pelea..........",
    "como si quiera es eso posible...",
    "olvidalo chico me da igual"
  ];

  let index = 0;
  const showNext = () => {
    if (index >= lines.length) {
      this.finish("win");
      return;
    }

    this.showOverlayMessage(lines[index]);
    index += 1;
    setTimeout(showNext, 1400);
  };

  showNext();
}

triggerImmortalPhase() {
  // Fase especial: enemigo no puede morir todavia (queda en 1 HP).
  this.immortalPhaseTriggered = true;
  const battleUI = this.element.querySelector(".battle-ui");
  battleUI.innerHTML = "";

  const lines = [
    "No puedes derrotarme...",
    "No importa cuanto ataques, no voy a caer.",
    "JAJAJAJAJA"
  ];

  let index = 0;
  const showNext = () => {
    if (index >= lines.length) {
      this.unlockSuperPower();
      return;
    }

    this.showOverlayMessage(lines[index]);
    index += 1;
    setTimeout(showNext, 1400);
  };

  showNext();
}

unlockSuperPower() {
  // Desbloquea boton final que permite terminar la batalla.
  if (this.superPowerUnlocked) return;
  this.superPowerUnlocked = true;
  this.clearOverlayMessage();

  const battleUI = this.element.querySelector(".battle-ui");
  battleUI.innerHTML = `
    <button class="super-power-button" type="button">SUPER POWER</button>
  `;

  const button = battleUI.querySelector(".super-power-button");
  button.addEventListener("click", () => {
    this.activeCombatants.enemy.hp = 0;
    this.activeCombatants.enemy.isDead = true;
    this.updateHP();
    this.stopBattleMusic();
    this.playVictorySound();
    this.showMessage("Erio fue derrotado por tu SUPER POWER.");
    setTimeout(() => this.finish("win"), this.victoryDelay);
  }, { once: true });
}

startBattleMusic() {
  // Reproduce musica de combate desde el inicio.
  this.battleMusic.currentTime = 0;
  this.battleMusic.play().catch(() => {});
}

stopBattleMusic() {
  // Detiene musica de combate y reinicia posicion.
  this.battleMusic.pause();
  this.battleMusic.currentTime = 0;
}

playHitSound() {
  // Reproduce sonido de golpe (clon para evitar bloqueo de solape).
  const sfx = this.hitSound.cloneNode();
  sfx.volume = 1;
  sfx.play().catch(() => {});
}

playVictorySound() {
  this.victorySound.currentTime = 0;
  this.victorySound.volume = 1;
  this.victorySound.play().catch(() => {});
}

showMessage(text) {
  // Mensaje en el panel inferior de batalla.
  this.clearOverlayMessage();
  const battleUI = this.element.querySelector(".battle-ui");
  battleUI.innerHTML = `<p class="battle-message">${text}</p>`;
}

showOverlayMessage(text) {
  // Mensaje flotante sobre la escena de combate.
  const scene = this.element.querySelector(".battle-scene");
  this.clearOverlayMessage();
  const message = document.createElement("p");
  message.classList.add("battle-overlay-message");
  message.textContent = text;
  scene.appendChild(message);
}

clearOverlayMessage() {
  const message = this.element.querySelector(".battle-overlay-message");
  if (message) {
    message.remove();
  }
}

playAttackAnimation(attackerSide, targetSide) {
  // Aplica clases CSS de ataque/golpe para animacion visual.
  const scene = this.element.querySelector(".battle-scene");
  const attackClass = attackerSide === "player" ? "is-attacking-player" : "is-attacking-enemy";
  const hitClass = targetSide === "player" ? "is-hit-player" : "is-hit-enemy";

  scene.classList.add(attackClass);

  setTimeout(() => {
    scene.classList.remove(attackClass);
    scene.classList.add(hitClass);
  }, 260);

  setTimeout(() => {
    scene.classList.remove(hitClass);
  }, 620);
}

  updateHP() {
  // Sincroniza barras y texto de HP con estado actual.
  const enemyPercent =
    (this.activeCombatants.enemy.hp /
      this.activeCombatants.enemy.maxHp) * 100;

  const playerPercent =
    (this.activeCombatants.player.hp /
      this.activeCombatants.player.maxHp) * 100;

  this.element.querySelector(".enemy-hp-fill").style.width =
    enemyPercent + "%";

  this.element.querySelector(".player-hp-fill").style.width =
    playerPercent + "%";

  this.element.querySelector(".enemy-hp-text").textContent =
    `HP: ${this.activeCombatants.enemy.hp}/${this.activeCombatants.enemy.maxHp}`;

  this.element.querySelector(".player-hp-text").textContent =
    `HP: ${this.activeCombatants.player.hp}/${this.activeCombatants.player.maxHp}`;
}

  createTeams() {
    // Crea equipos iniciales y define combatientes activos.
    this.playerTeam = new Team({
      team: "player",
      combatants: [
        new Combatant({
          name: "Hero",
          hp: 100,
          maxHp: 100,
          isPlayer: true,
          src: "imagenes/personajes/hero2.png"
        })
      ]
    });

    this.enemyTeam = new Team({
      team: "enemy",
      combatants: [
        new Combatant({
          name: "NPC 1",
          hp: 80,
          maxHp: 80,
          isPlayer: false,
          src: "imagenes/personajes/erio2.png"
        })
      ]
    });

    this.activeCombatants = {
      player: this.playerTeam.combatants[0],
      enemy: this.enemyTeam.combatants[0]
    };
  }

  createElement() {
  // Construye estructura DOM de la pantalla de batalla.
  this.element = document.createElement("div");
  this.element.classList.add("Battle");

  this.element.innerHTML = `
    <div class="battle-scene">

      <div class="enemy-area">
        <div class="hp-bar">
          <div class="hp-fill enemy-hp-fill"></div>
        </div>
        <div class="hp-text enemy-hp-text"></div>
        <img class="enemy-sprite" src="${this.activeCombatants.enemy.src}" alt="Enemy" />
      </div>

      <div class="player-area">
        <div class="hp-bar">
          <div class="hp-fill player-hp-fill"></div>
        </div>
        <div class="hp-text player-hp-text"></div>
        <img class="player-sprite" src="${this.activeCombatants.player.src}" alt="Player" />
      </div>

    </div>

    <div class="battle-ui"></div>
  `;

  this.container.appendChild(this.element);
  this.updateHP();
}}
