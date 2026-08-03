"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pato = void 0;
const Ave_1 = require("./Ave");
class pato extends Ave_1.ave {
    nombre;
    constructor(color, especie, sonido, nombre) {
        super(color, especie, sonido);
        this.nombre = nombre;
    }
    mostrarInformacion() {
        console.log(`El nombre del pato es: ${this.nombre}`);
        console.log(`El color es: ${this.color}`);
        console.log(`La especie es: ${this.especie}`);
        console.log(`El sonido que hace es: ${this.sonido}`);
    }
}
exports.pato = pato;
//# sourceMappingURL=Pato.js.map