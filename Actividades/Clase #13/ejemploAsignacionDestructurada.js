const persona = { nombre: "Luis", edad: 30, rol: "dev" };
const { nombre, rol: puesto = "invitado" } = persona;

const colores = ["rojo", "verde", "azul"];
const [primero, , tercero] = colores;

console.log(nombre, puesto); // luis dev
console.log(primero, tercero); // rojo azul
