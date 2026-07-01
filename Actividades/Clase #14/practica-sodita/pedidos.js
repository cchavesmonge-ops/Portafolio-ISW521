//esta clase no puede imprimir nada en consola, solo regresa datos
//decidir si vale la pena exportar de forma nombrada o por defecto en las demas clases, justificar la razon en cada archivo
import { pedidos } from "./main.js";

export function crearPedido(cliente, producto, precio, notas) {
    var pedido = {
        cliente: cliente,
        producto: producto,
        precio: precio,
        notas: notas
    };
    pedidos.push(pedido);
    return pedido;
}

export function calcularTotalPedido(pedidos) {
    var total = 0;
    for (var i = 0; i < pedidos.length; i++) {
        total = total + pedidos[i].precio;
    }
    return total;
}

export function aplicarDescuento(pedido, porcentaje) {
    pedido.precio = pedido.precio - (pedido.precio * porcentaje / 100);
    return pedido;
}