const generarResumen = ({ nombre, tipo, ...config }, ...banderas) => {
  const totalBanderas = banderas.length;

  return {
    ...config,
    nombre,
    tipo,
    totalBanderas,
    mensaje: `Resumen de ${nombre} (${tipo})`
  };
};

// Prueba
const configuracion = {
  nombre: "Sistema de Ventas",
  tipo: "Web",
  version: "1.0"
};

console.log(
  generarResumen(
    configuracion,
    "Producción",
    "Modo Seguro"
  )
);