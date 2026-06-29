import { Animal } from "./animal.js";

export class Perro extends Animal {
    constructor(especie, tamanio, edad, color, nombre, raza) {
        super(especie, tamanio, edad, color);
        this.nombre = nombre;
        this.raza = raza;
    }
    ladrar() {
        console.log("Guau guau");
    }
}

