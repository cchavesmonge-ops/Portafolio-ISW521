const readline = require("readline/promises");

const { stdin: input, stdout: output } = require("process");

const rl = readline.createInterface({ input, output });

async function calcularPin() {
    const valNum = /^([1-9]\s?)+$/;
    let num = 0;
    while (num < 3) {
        const pin = await rl.question("Digite su PIN: ");
        if (pin == 1234) {
            console.log("Correcto");
            break;
        } else if (num < 2) {
            console.log("Incorrecto, intente de nuevo");
        } else {
            console.log("Incorrecto, intentos superados");
        }
        num++;
    }
    rl.close();
}

calcularPin();