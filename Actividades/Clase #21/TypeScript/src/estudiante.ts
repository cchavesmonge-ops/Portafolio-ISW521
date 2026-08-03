export class estudiante {

    cedula: string;
    nombre: string;
    primer_apellido: string;
    edad: number;

    constructor(cedula: string, nombre: string, primer_apellido: string, edad: number) {
        this.cedula = cedula;
        this.nombre = nombre;
        this.primer_apellido = primer_apellido;
        this.edad = edad;
    }

    matricular(): void {
        console.log(`la cedula es : ${this.cedula}`)
        console.log(`el nombre es : ${this.nombre}`)
        console.log(`el primer apellido es : ${this.primer_apellido}`)
        console.log(`la edad es : ${this.edad}`)
    }
}