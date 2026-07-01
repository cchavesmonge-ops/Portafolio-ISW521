const numeros = [100, 20, 15, 14, 36];
console.log(numeros.sort((a, b) => a - b));
console.log(numeros.sort((a, b) => b - a));

for (let i = 0; i < numeros.length; i++) { //imperativo
    console.log(numeros[i]);
}

const declarativo = numeros.map((n) => n);//declarativo

console.log(declarativo);