(function () {
  // Punto de entrada del juego: crea el overworld y lo inicializa.

  const overworld = new Overworld({
    element: document.querySelector(".game-container")
  });
  overworld.init();

})();
