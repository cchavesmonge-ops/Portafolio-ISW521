const readline = require("readline/promises");

const { stdin: input, stdout: output } = require("process");

const rl = readline.createInterface({ input, output });

async function iniciar() {
    const nombre = await rl.question("Digite su nombre: ");
    const valLetras = /^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]\s?)+$/
    if (valLetras.test(nombre)) {
        console.log(`El nombre escrito fue: ${nombre}`);
    } else {
        console.log("Error: Solo se permiten letras");
    }

    rl.close();
}

iniciar();