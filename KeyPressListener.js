class KeyPressListener {
  constructor(keyCode, callback) {
    // Evita disparar multiples veces mientras la tecla permanece presionada.
    let keySafe = true;
    this.keydownFunction = function(event) {
      if (event.code === keyCode) {
         if (keySafe) {
            keySafe = false;
            callback();
         }  
      }
   };
   // Al soltar la tecla, habilita de nuevo el callback.
   this.keyupFunction = function(event) {
      if (event.code === keyCode) {
         keySafe = true;
      }         
   };
   // Registra listeners al crear la instancia.
   document.addEventListener("keydown", this.keydownFunction);
   document.addEventListener("keyup", this.keyupFunction);
  }

  unbind() { 
    // Limpia listeners para evitar fugas o dobles eventos.
    document.removeEventListener("keydown", this.keydownFunction);
    document.removeEventListener("keyup", this.keyupFunction);
  }


}
