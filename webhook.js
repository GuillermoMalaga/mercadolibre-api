// server.js

// Importar dependencias
const AWS = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const dotenv = require("dotenv");
const sendMessageToSQS = require("./insert_sqs");
const axios = require("axios");
// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Variables desde .env
var ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Archivo donde se almacenarán las notificaciones
const NOTIFICATIONS_FILE = "notifications.txt";

// Ruta para el webhook
app.post("/webhook", (req, res) => {
  const notification = req.body;

  console.log("Notificación recibida:", notification);

  //Procesa la notificación
  processNotification(notification);

  res.status(200).send("OK"); // Importante responder con un 200
});

// Ruta para ver las notificaciones en la web
app.get("/notifications", (req, res) => {
  if (!fs.existsSync(NOTIFICATIONS_FILE)) {
    return res.send("<h1>No hay notificaciones disponibles.</h1>");
  }

  // Leer las notificaciones desde el archivo
  const data = fs.readFileSync(NOTIFICATIONS_FILE, "utf-8");

  // Formatear para despliegue en HTML
  const html = `
    <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificaciones Atractivas</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
        }

        .notification-box {
            width: auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .notification-header {
            background-color: #6200ea;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }

        .notification-body {
            padding: 15px;
            max-height: auto;
            overflow-y: auto;
        }

        .notification-item {
            padding: 10px;
            margin-bottom: 10px;
            background-color: #f1f1f1;
            border-radius: 5px;
            animation: fadeIn 0.5s ease-in-out;
        }

        .notification-item:last-child {
            margin-bottom: 0;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .notification-input {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            background-color: #f8f8f8;
        }

        .notification-input input {
            width: 70%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .notification-input button {
            padding: 8px 15px;
            background-color: #6200ea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .notification-input button:hover {
            background-color: #3700b3;
        }
    </style>
</head>
<body>

<div class="notification-box">
    <div class="notification-header">
        Notificaciones
    </div>
    <div class="notification-body" id="notification-body">
        <!-- Las notificaciones aparecerán aquí -->
        <pre>${data}</pre>
    </div>    
</div>
</body>
</html>
  `;

  res.send(html);
});
// Endpoint para recibir notificaciones de Mercado Libre
app.post("/webhook-gmg", (req, res) => {
  const notification = req.body;
  res.status(200).send("OK"); // Importante responder con un 200
  console.log("Notificación recibida para webhooke-gmg:", notification);

  //Procesa la notificación
  processNotification(notification);
});

//Funcion para Procesar las notificaciones
async function processNotification(notification) {
  let message_detalle;
  //aqui se renvia a ML con id para recuperar los mensajes con detalle
  console.log(typeof notification);
  const resource_message = notification;
  console.log("El recurso del mensaje es :" + resource_message["resource"]);

  // Variables
  dotenv.config();
  ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  const QUESTION_ID = resource_message["resource"]; // Reemplaza con tu ID de pregunta

  // URL de la API
  const url = `https://api.mercadolibre.com/${QUESTION_ID}`;

  // Realizar la solicitud GET
  axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`, // Encabezado de autorización
      },
    })
    .then((response) => {
      console.log(
        "Respuesta de la API del mensaje con detalle:",
        response.data
      );
      message_detalle = response.data;
    })
    .catch((error) => {
      console.error(
        "Error al realizar la solicitud del mensage con detalle:",
        error.response?.data || error.message
      );
    });

  //hasta aqui el reenvio de mensajes
  const messageBody = JSON.stringify(message_detalle);
  const messageAttributes = {
    Author: {
      DataType: "String",
      StringValue: "Juan Pérez",
    },
    Priority: {
      DataType: "Number",
      StringValue: "1", // Aunque es un número, debe estar en formato de cadena.
    },
  };
  //Ejemplo de como puedes procesar el tipo de notificacion
  if (notification.topic == "messages") {
    try {
      await sendMessageToSQS(messageBody, messageAttributes);
      console.log("Mensaje enviado a la cola SQS");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
    console.log("Nuevo mensaje:", notification);
    // Guardar notificación en el archivo
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(
      notification
    )}\n`;
    fs.appendFileSync(NOTIFICATIONS_FILE, logEntry);
  } else if (notification.topic == "orders") {
    try {
      await sendMessageToSQS(messageBody, messageAttributes);
      console.log("Mensaje enviado a la cola SQS");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
    console.log("Nueva orden:", notification);
    // Guardar notificación en el archivo
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(
      notification
    )}\n`;
    fs.appendFileSync(NOTIFICATIONS_FILE, logEntry);
  } else if (notification.topic == "questions") {
    try {
      await sendMessageToSQS(messageBody, messageAttributes);
      console.log("Mensaje enviado a la cola SQS");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
    console.log("Nueva pregunta:", notification);
    // Guardar notificación en el archivo
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(
      notification
    )}\n`;
    fs.appendFileSync(NOTIFICATIONS_FILE, logEntry);
  } else {
    try {
      await sendMessageToSQS(messageBody, messageAttributes);
      console.log("Mensaje enviado a la cola SQS");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
    console.log("Notificacion desconocida: ", notification);
    // Guardar notificación en el archivo
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(
      notification
    )}\n`;
    fs.appendFileSync(NOTIFICATIONS_FILE, logEntry);
  }

  // Aquí puedes realizar acciones como:
  // - Guardar la información en una base de datos.
  // - Enviar un correo electrónico o notificación.
  // - Actualizar información en tu sistema.
  // - Etc.

  // Recuerda que debes verificar la autenticidad de la notificación antes de realizar acciones importantes.
}
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
