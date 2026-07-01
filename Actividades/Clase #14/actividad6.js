const gastos = [
    { cat: "comida", monto: 5000 },
    { cat: "transporte", monto: 2000 },
    { cat: "comida", monto: 3000 },
];

const porCategoria = gastos.reduce((acc, g) => {
    acc[g.cat] = (acc[g.cat] || 0) + g.monto
    return acc
}, {})

console.log(porCategoria);
// { comida: 8000, transporte: 2000 }

const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
console.log(totalGastos);
// 10000
