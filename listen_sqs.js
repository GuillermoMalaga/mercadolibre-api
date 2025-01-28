const AWS = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const dotenv = require("dotenv");
dotenv.config();

// Credenciales (¡REEMPLAZA CON CREDENCIALES SEGURAS EN PRODUCCIÓN!)
varaccessKeyId = process.env.accessKeyId;
var secretAccessKey = process.env.secretAccessKey;
const region = "us-east-1";
const queueUrl =
  "https://sqs.us-east-1.amazonaws.com/457564458476/mgg-ml-webhook";

// Configurar el AWS SDK con las credenciales
AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
});

const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

// Función asíncrona para recibir mensajes
async function receiveMessages() {
  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10, // Puedes ajustar esto (max 10)
    WaitTimeSeconds: 20, // Tiempo de espera para mensajes (max 20 segundos)
  };

  try {
    const data = await sqs.receiveMessage(params).promise();

    if (data.Messages) {
      data.Messages.forEach((message) => {
        // Manejar el mensaje
        console.log("Mensaje recibido:", message.Body);
        console.log("MessageAttributes:", message.MessageAttributes);

        // Eliminar el mensaje de la cola después de procesarlo
        deleteMessage(message.ReceiptHandle);
      });
    } else {
      console.log("No hay mensajes disponibles en este momento.");
    }
  } catch (err) {
    console.error("Error al recibir mensajes:", err);
  }
}

// Función asíncrona para eliminar un mensaje de la cola
async function deleteMessage(receiptHandle) {
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  };

  try {
    await sqs.deleteMessage(params).promise();
    console.log("Mensaje eliminado de la cola.");
  } catch (err) {
    console.error("Error al eliminar el mensaje:", err);
  }
}

// Función principal para ejecutar la recepción de mensajes
async function main() {
  console.log("Iniciando la escucha de mensajes desde SQS...");
  while (true) {
    await receiveMessages();
  }
}

main();
