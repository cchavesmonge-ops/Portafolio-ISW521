export class ave {
    color: string;
    especie: string;
    sonido: string;

    constructor(color: string, especie: string, sonido: string) {
        this.color = color;
        this.especie = especie;
        this.sonido = sonido;
    }

    comer(alimento: string): void {
        console.log(`El ave esta comiendo ${alimento}`);
    }

    hacerRuido(): void {
        console.log(`${this.sonido}`);
    }
}