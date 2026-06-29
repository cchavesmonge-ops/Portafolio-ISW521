function saludar(nombre) {
    return `Hola, ${nombre}`;
}

function procesar(funcionSaludo, nombre) {
    return funcionSaludo(nombre).toUpperCase();
}

console.log(procesar(saludar, "Cesar"));
// "HOLA, CESAR"