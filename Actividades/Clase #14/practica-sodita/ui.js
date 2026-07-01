//esta clase mostrara mensajes en consola, ninguna otra clase puede imprimir nada en consola, la logica de datos y presentacion deben estar separadas
//decidir si vale la pena exportar de forma nombrada o por defecto en las demas clases, justificar la razon en cada archivo

export function mostrarPedido(pedido) {
    console.log("Pedido: " + pedido.cliente + " - " + pedido.producto + " - " + pedido.precio);
}

export function mostrarTotalDia(total) {
    console.log("Total del dia: " + total);
}

