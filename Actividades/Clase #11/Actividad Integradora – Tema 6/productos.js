export const agregarProducto = (lista, { nombre, precio }) => {
    lista.push({ nombre, precio });
    console.log(`Agregado: ${nombre} - $${precio}`);
};

export const calcularTotal = (lista) =>
    lista.reduce((total, { precio }) => total + (precio ?? 0), 0);