"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ave = void 0;
class ave {
    color;
    especie;
    sonido;
    constructor(color, especie, sonido) {
        this.color = color;
        this.especie = especie;
        this.sonido = sonido;
    }
    comer(alimento) {
        console.log(`El ave esta comiendo ${alimento}`);
    }
    hacerRuido() {
        console.log(`${this.sonido}`);
    }
}
exports.ave = ave;
//# sourceMappingURL=Ave.js.map