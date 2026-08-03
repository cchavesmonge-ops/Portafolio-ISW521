"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log("hola companera joselyn");
console.log("hola companero leal");
console.log("hola companera belen");
let nombre = "hola bbe";
let nombreDos = "Shakira";
function saludar(nombre) {
    console.log(`Hola ${nombre}`);
}
function sumar(a, b) {
    return a + b;
}
function restar(a, b, c) {
    return a - b - (c || 0);
}
console.log(restar(10, 5, 2));
const estudiante_1 = require("./estudiante");
let Estudiante = new estudiante_1.estudiante("205550666", "pepe", "angulo", 22);
Estudiante.matricular();
const Pato_1 = require("./Pato");
let Pato = new Pato_1.pato("blanco", "domestico", "cuac cuac", "donnald");
Pato.comer("insectos");
Pato.hacerRuido();
Pato.mostrarInformacion();
//# sourceMappingURL=index.js.map