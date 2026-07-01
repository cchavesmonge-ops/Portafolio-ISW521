export const renderizarResultado = (cantidad) => {
    const contenedor = document.querySelector("#app")
    contenedor.innerHTML = `<div class="tarjeta">
        <h2>${"Gestion de usuarios"}</h2>
    <p>La cantidad de usuarios es: ${cantidad}</p>
</div>
`;
}