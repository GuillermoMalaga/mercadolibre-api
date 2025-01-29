const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const dotenv = require("dotenv");
dotenv.config();
// Configuración del cliente SQS
const client = new SQSClient({
  region: process.env.region,
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});

// URL de la cola FIFO
const queueUrl = process.env.queueUrl;

const sendMessage = async () => {
  try {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({
        id: 13259380928,
        seller_id: 347725918,
        text: "sera para satellite c45 14 pulgadas",
        tags: null,
        status: "ANSWERED",
        item_id: "MLC1485659745",
        date_created: "2025-01-23T16:17:28.620-04:00",
        answer: {
          text: "Hola. Necesita el código que sale en la etiqueta de la pantalla misma, el que incluye 140 o 156 (Hay que sacar la pantalla del equipo para verlo). Y NO, NO ES TÁCTIL. Saludos!",
          status: "ACTIVE",
          date_created: "2025-01-23T20:11:01.172-04:00",
        },
        from: { id: 2180141137 },
      }),
      MessageGroupId: "Group1", // Obligatorio para FIFO
      MessageDeduplicationId: Date.now().toString(), // ID único para deduplicación
    };

    const command = new SendMessageCommand(params);
    const response = await client.send(command);
    console.log("Mensaje enviado con éxito:", response);
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
  }
};

sendMessage();
