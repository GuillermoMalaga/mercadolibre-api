// Importar las dependencias necesarias
const { MongoClient } = require("mongodb");
require("dotenv").config(); // Cargar las variables del archivo .env

// Obtener la cadena de conexión desde las variables de entorno
const uri = process.env.MONGODB_URI;

// Función para conectar a la base de datos
async function conectarDB() {
  try {
    // Crear un cliente de MongoDB
    const cliente = new MongoClient(uri);

    // Establecer la conexión
    await cliente.connect();
    console.log("Conexión a MongoDB exitosa");

    // Devolver el cliente conectado (puede usarse para interactuar con la DB)
    return cliente;
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw error; // Lanzar el error para que se pueda manejar más arriba si es necesario
  }
}

// Exportar la función de conexión para usarla en otros scripts
module.exports = { conectarDB };
