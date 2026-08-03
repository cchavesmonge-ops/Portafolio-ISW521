console.log("hola companera joselyn");
console.log("hola companero leal");
console.log("hola companera belen");

let nombre: string = "hola bbe";
let nombreDos = "Shakira";

function saludar(nombre: string): void {
    console.log(`Hola ${nombre}`);
}

function sumar(a: number, b: number): number {
    return a + b;
}

function restar(a: number, b: number, c?: number): number {
    return a - b - (c || 0);
}

console.log(restar(10, 5, 2));

import { estudiante } from "./estudiante";

let Estudiante = new estudiante("205550666", "pepe", "angulo", 22);
Estudiante.matricular();

import { pato } from "./Pato";
let Pato = new pato("blanco", "domestico", "cuac cuac", "donnald");
Pato.comer("insectos");
Pato.hacerRuido();
Pato.mostrarInformacion();