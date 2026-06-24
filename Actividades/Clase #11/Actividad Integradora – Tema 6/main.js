import { agregarProducto, calcularTotal } from "./productos.js";
import { mostrarTotal, mostrarCategoria } from "./ui.js";

const productos = [];

agregarProducto(productos, {
    nombre: "Teclado",
    precio: 15000
});

agregarProducto(productos, {
    nombre: "Mouse",
    precio: 8000
});

const total = calcularTotal(productos);

mostrarTotal(total);

const jsonAPI = {
    categoria: null
};

mostrarCategoria(jsonAPI);