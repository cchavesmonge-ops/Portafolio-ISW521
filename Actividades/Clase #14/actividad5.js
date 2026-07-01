const estudiantes = [
    { nombre: "Ana", promedio: 85 },
    { nombre: "Luis", promedio: 67 },
    { nombre: "sara", promedio: 91 },
];

const estudiantesAprobados = estudiantes.filter(e => e.promedio >= 80);
console.log(estudiantesAprobados);
// { nombre: "Ana", promedio: 85 }, { nombre: "sara", promedio: 91 }