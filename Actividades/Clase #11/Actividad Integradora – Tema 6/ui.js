export const mostrarTotal = (total) => {
    console.log(`Total: $${total}`);
};

export const mostrarCategoria = (datos) => {
    const categoria = datos?.categoria ?? "Sin categoría";
    console.log(`Categoría: ${categoria}`);
};