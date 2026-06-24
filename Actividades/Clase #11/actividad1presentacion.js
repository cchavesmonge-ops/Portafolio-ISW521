declarada();
function declarada() {
    console.log("declarada() ejecutada sin problema (hoisting completo)");
}
try {
    expresada();
} catch (e) {
    console.log(`expresada() lanzó: ${e.constructor.name} — ${e.message}`);
}
const expresada = function () {
    console.log("expresada ejecutada");
};
const flecha = () => { };
try {
    new flecha();
} catch (e) {
    console.log(`new flecha() lanzo: ${e.constructor.name} - ${e.message}`);
}