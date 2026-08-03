import { ave } from "./Ave";

export class pato extends ave {

    nombre: string;

    constructor(color: string, especie: string, sonido: string, nombre: string) {
        super(color, especie, sonido);
        this.nombre = nombre;

    }

    mostrarInformacion(): void {
        console.log(`El nombre del pato es: ${this.nombre}`);
        console.log(`El color es: ${this.color}`);
        console.log(`La especie es: ${this.especie}`);
        console.log(`El sonido que hace es: ${this.sonido}`);
    }

}