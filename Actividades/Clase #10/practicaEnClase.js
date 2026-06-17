const v8 = require('v8');

const variableJulian={
    nombre:"Javascript",
    version: 2026,
};

const tamano = v8.serialize(variableJulian).length;

console.log(`El tamaño de la variable es de: ${tamano} bytes`);
//var
if (true) {
    var edad = 50;
    console.log(`La edad de Jeffry es: ${edad} años`);
}
//let
if (true) {
    let nota = 10;
    console.log(`La nota de Cesar es: ${nota} / 10`);
}
//const
const dinero = 1000000;
console.log(`El dinero de su cuenta es: ${dinero}`);

// if/else / ternario - 1-12 niño 13-17 adolescente 18+ adulto
let edad = 15;

if (edad >= 1 && edad <= 12) {
    console.log("Niño");
} else if (edad >= 13 && edad <= 17) {
    console.log("Adolescente");
} else if (edad >= 18) {
    console.log("Adulto");
} else {
    console.log("Edad no válida");
}

let categoria = (edad >= 1 && edad <= 12)
    ? "Niño"
    : (edad >= 13 && edad <= 17)
        ? "Adolescente"
        : (edad >= 18)
            ? "Adulto"
            : "Edad no válida";

console.log(categoria); 