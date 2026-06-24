const cronometroRoto = {
    segundos: 0,
    iniciar: function () {
        setTimeout(function () {
            this.segundos++;
            console.log("Roto - this.segundos:", this.segundos);
        }, 100);
    },
};
cronometroRoto.iniciar();

const cronometro1 = {
    segundos: 0,
    iniciar: function () {
        setTimeout(() => {
            this.segundos++;
            console.log("Solución 1 (arrow) - segundos:", this.segundos);
        }, 200);
    },
};
cronometro1.iniciar();

const cronometro2 = {
    segundos: 0,
    iniciar: function () {
        setTimeout(function () {
            this.segundos++;
            console.log("Solución 2 (bind)  - segundos:", this.segundos);
        }.bind(this), 300);
    },
};
cronometro2.iniciar();