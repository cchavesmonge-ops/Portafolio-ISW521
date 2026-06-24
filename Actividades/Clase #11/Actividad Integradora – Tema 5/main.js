import { formatearPrecio, calcularIVA } from "./utilidades.js";
import ProductoCard from "./ProductoCard.js";

const producto = {
    nombre: "Laptop",
    precio: 850000
};

console.log(formatearPrecio(producto.precio));
console.log(calcularIVA(producto.precio));
console.log(ProductoCard(producto));