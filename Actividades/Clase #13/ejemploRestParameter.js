function sumarTodo(...numeros) {
    return numeros.reduce((acum, n) => acum + n, 0);
}


console.log(sumarTodo(1, 2, 3)); //6
console.log(sumarTodo(5, 10, 15, 20)); //50