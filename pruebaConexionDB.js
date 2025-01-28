// Importar la función de conexión desde conectarMongo.js
const { conectarDB } = require("./conectarMongo");

async function ejecutarApp() {
  try {
    // Conectar a la base de datos
    const cliente = await conectarDB();

    // Seleccionar la base de datos y la colección
    const db = cliente.db(); // Si no se especifica la base de datos, usará la que se haya configurado en la URI
    const coleccion = db.collection("notificaciones");

    // Insertar un documento de ejemplo
    const resultado = await coleccion.insertOne({
      nombre: "Ruben  Blanco",
      pais: "MOnte Carlo",
    });
    console.log("Documento insertado:", resultado.insertedId);

    // Cerrar la conexión
    await cliente.close();
    console.log("Conexión cerrada");
  } catch (error) {
    console.error("Error al ejecutar la aplicación:", error);
  }
}

// Ejecutar la aplicación
ejecutarApp();
