"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estudiante = void 0;
class estudiante {
    cedula;
    nombre;
    primer_apellido;
    edad;
    constructor(cedula, nombre, primer_apellido, edad) {
        this.cedula = cedula;
        this.nombre = nombre;
        this.primer_apellido = primer_apellido;
        this.edad = edad;
    }
    matricular() {
        console.log(`la cedula es : ${this.cedula}`);
        console.log(`el nombre es : ${this.nombre}`);
        console.log(`el primer apellido es : ${this.primer_apellido}`);
        console.log(`la edad es : ${this.edad}`);
    }
}
exports.estudiante = estudiante;
//# sourceMappingURL=estudiante.js.map