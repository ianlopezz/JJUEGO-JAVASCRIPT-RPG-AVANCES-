let jugador;
let enemigo;
let turnoJugador = true;

const clases = {
    melee: { vida: 120, ataque: 20, defensa: 15},
    mago: { vida: 80, ataque: 30, defensa: 5},
    tirador: { vida: 100, ataque: 22, defensa: 10 }
};


function crearJugador(tipo) {
    jugador = { ...clases[tipo] };
    enemigo = { ...clases[randomClase()] };

    document.getElementById("seleccionClase").style.display = "1";
    document.getElementById("combate").style.display = "block";

    

    actualizarVida();
}

function randomClase() {
    const keys = Object.keys(clases);
    return keys[Math.floor(Math.random() * keys.length)];
}

function atacar() {
    if (!turnoJugador) return;

    hacerDaño(jugador, enemigo);
    turnoJugador = false;

    setTimeout(turnoEnemigo, 1000);
}

function turnoEnemigo() {
    hacerDaño(enemigo, jugador);
    turnoJugador = true;
}

function hacerDaño(atacante, defensor) {

    let daño = atacante.ataque - defensor.defensa / 2;

    // Ventaja elemental
    if (elementos[atacante.elemento] === defensor.elemento) {
        daño *= 1.5;
        log("¡Debilidad explotada!");
    }

    // Crítico
    if (Math.random() < 0.15) {
        daño *= 2;
        log("¡Golpe crítico!");
    }

    daño = Math.max(5, Math.floor(daño));
    defensor.vida -= daño;

    log(`Daño hecho: ${daño}`);
    actualizarVida();
    verificarFin();
}

function habilidadEspecial() {
    if (!turnoJugador) return;

    let daño = jugador.ataque * 1.8;
    enemigo.vida -= daño;

    log("Habilidad especial usada!");
    actualizarVida();
    verificarFin();

    turnoJugador = false;
    setTimeout(turnoEnemigo, 1000);
}

function actualizarVida() {
    document.getElementById("vidaJugador").textContent =
        "Vida: " + jugador.vida;

    document.getElementById("vidaEnemigo").textContent =
        "Vida: " + enemigo.vida;
}

function verificarFin() {
    if (jugador.vida <= 0) {
        log("Has perdido");
    }
    if (enemigo.vida <= 0) {
        log("Has ganado");
    }
}

function log(texto) {
    document.getElementById("log").textContent = texto;
}
