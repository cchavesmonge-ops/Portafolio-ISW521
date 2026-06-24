const perfil = {
    nombre: "Luis",
    direccion: null,
    descuento: 0
};

const ciudad = perfil?.direccion?.ciudad ?? "No registrada";
const descuento = perfil?.descuento ?? 10;

console.log(ciudad);
console.log(descuento);