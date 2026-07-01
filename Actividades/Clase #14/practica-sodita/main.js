//esta clase debe ser la que conecte las otras clases entre si, por eso es el main, no puede imprimir en consola, es el punto de entrada
//decidir si vale la pena exportar de forma nombrada o por defecto en las demas clases, justificar la razon en cada archivo
import { crearPedido } from "./pedidos.js";
import { calcularTotalPedido } from "./pedidos.js";
import { aplicarDescuento } from "./pedidos.js";
import { mostrarTotalDia } from "./ui.js";

var nombreSoda = "La Sodita UTN";
var pedidos = [];

export function calcularTotalDia() {
    var total = 0;
    for (var i = 0; i < pedidos.length; i++) {
        total = total + pedidos[i].precio;
    }
    return total;
}


crearPedido("Ana", "Casado", 2500, "Sin cebolla");
crearPedido("Luis", "Cafe con pan", 1200, undefined);

var totalDia = calcularTotalPedido(pedidos);
mostrarTotalDia(totalDia);