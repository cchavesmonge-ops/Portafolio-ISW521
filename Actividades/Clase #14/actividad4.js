const estudiantes = [
    { nombre: "Ana", carnet: "2024001" },
    { nombre: "Luis", carnet: "2024002" }
];
const format = estudiantes.map(e => `${e.nombre} (${e.carnet})`.toUpperCase());
console.log(format);