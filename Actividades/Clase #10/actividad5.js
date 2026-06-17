const v8 = require('v8');

const rol = "admin";
//a
var permisoTernario = (rol === "admin")
    ? "tiene acceso completo"
    : (rol === "editor") ? "tiene acceso de lectura y escritura"
        : (rol === "viewer") ? "tiene acceso de solo lectura"
            : "rol no reconocido";
console.log(`ternario, El rol de usuario es: ${rol} y ${permisoTernario}`);

//b
var permiso;
switch (rol) {
    case "admin":
        permiso = "tiene acceso completo";
        break;
    case "editor":
        permiso = "tiene acceso de lectura y escritura";
        break;
    case "viewer":
        permiso = "tiene acceso de solo lectura";
        break;
    default:
        permiso = "rol no reconocido";
        break;
}
console.log(`switch, El rol de usuario es: ${rol} y ${permiso}`);

