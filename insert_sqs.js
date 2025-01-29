const AWS = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const dotenv = require("dotenv");
dotenv.config();
/**
 * Envia un mensaje a una cola SQS de AWS.
 *
 * @param {string} messageBody - El cuerpo del mensaje a enviar.
 * @param {object} [messageAttributes] - Atributos opcionales del mensaje (ej: metadatos).
 * @returns {Promise} Una promesa que se resuelve con los datos de la respuesta o se rechaza con un error.
 */
async function sendMessageToSQS(messageBody, messageAttributes = {}) {
  // Credenciales (¡REEMPLAZA CON CREDENCIALES SEGURAS EN PRODUCCIÓN!)
  var accessKeyId = process.env.accessKeyId;
  var secretAccessKey = process.env.secretAccessKey;
  var region = process.env.region;
  var queueUrl = process.env.queueUrl;

  // 1. Crear un objeto SQS
  const sqs = new AWS.SQS({
    apiVersion: "2012-11-05",
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region,
  });

  // 2. Definir los parámetros del mensaje
  const params = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
    MessageAttributes: messageAttributes, // Añadir atributos si se proporcionan
  };

  try {
    // 3. Enviar el mensaje
    const data = await sqs.sendMessage(params).promise();
    console.log("Mensaje enviado con éxito:", data.MessageId);
    return data; // Devolver los datos de la respuesta
  } catch (err) {
    console.error("Error al enviar el mensaje:", err);
    throw err; // Lanzar el error para que el llamador pueda manejarlo
  }
}

// Ejemplo de uso
/* async function main() {
  const messageBody = 'Este es un mensaje de prueba enviado por la función.';
  const messageAttributes = {
      'Author': {
          DataType: 'String',
          StringValue: 'Juan Pérez'
      },
      'Priority': {
          DataType: 'Number',
          StringValue: '1'
      }
  };


    try {
        await sendMessageToSQS(messageBody, messageAttributes);
        console.log('Mensaje enviado a la cola SQS');
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
}

main(); */

module.exports = sendMessageToSQS;
