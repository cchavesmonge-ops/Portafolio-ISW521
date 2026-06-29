const original = { nombre: "Equipo A", puntos: 10 };
const actualizado = { ...original, puntos: 15 };

console.log(original); // 10 (no cambio)
console.log(actualizado); // 15

const numeros = [1, 2, 3];
const copia = [...numeros, 4];