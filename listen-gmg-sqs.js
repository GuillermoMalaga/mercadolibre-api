const { MongoClient } = require("mongodb");
const cleanDeep = require("clean-deep");
const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require("@aws-sdk/client-sqs");

// Configuración de MongoDB
const mongoUri = "mongodb://186.64.123.207:27017/";
const dbName = "gmg-ML"; // nombre de la base de datos
const client = new MongoClient(mongoUri);

// Configuración de SQS
const sqsClient = new SQSClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: "AKIAYRH5NGQYUJJSLUGG",
    secretAccessKey: "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",
  },
});
const queueUrl =
  "https://sqs.us-east-2.amazonaws.com/586794480689/mi-sqs-gmg.fifo";

// Función para guardar mensajes en MongoDB
const saveMessageToMongo = async (message) => {
  try {
    const db = client.db(dbName);

    // Limpia el mensaje usando clean-deep
    const cleanedMessage = cleanDeep(message);

    // Determina el tipo (_type) y el ID del mensaje (_id)
    const _type = message.status; // Cambia esto según cómo determines el tipo del mensaje
    const _id =
      cleanedMessage.id || cleanedMessage.MessageId || new Date().toISOString(); // Genera un ID único si no existe

    // Reemplaza o inserta el mensaje en MongoDB
    await db
      .collection("mel_" + _type)
      .replaceOne(
        { _id },
        cleanedMessage,
        { upsert: true },
        (err, response) => {
          if (err) {
            console.error("Error al guardar en MongoDB:", err);
          } else {
            console.log("Mensaje guardado en MongoDB:", response);
          }
        }
      );
  } catch (error) {
    console.error("Error al guardar el mensaje en MongoDB:", error);
  }
};

// Función para procesar los mensajes de SQS
const processMessagesFromSQS = async () => {
  try {
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };

    const command = new ReceiveMessageCommand(params);
    const response = await sqsClient.send(command);

    if (response.Messages && response.Messages.length > 0) {
      console.log("Mensajes recibidos:", response.Messages);

      for (const message of response.Messages) {
        console.log("Procesando mensaje:", message.Body);

        // Guarda el mensaje en MongoDB
        await saveMessageToMongo(JSON.parse(message.Body));

        // Elimina el mensaje de la cola después de procesarlo
        await deleteMessage(message.ReceiptHandle);
      }
    } else {
      console.log("No hay mensajes en la cola.");
    }
  } catch (error) {
    console.error("Error al procesar mensajes de SQS:", error);
  }
};

// Función para eliminar mensajes de SQS
const deleteMessage = async (receiptHandle) => {
  try {
    const params = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };

    const command = new DeleteMessageCommand(params);
    await sqsClient.send(command);
    console.log("Mensaje eliminado de la cola.");
  } catch (error) {
    console.error("Error al eliminar el mensaje de SQS:", error);
  }
};

// Iniciar la conexión a MongoDB y procesar mensajes de SQS
const run = async () => {
  try {
    await client.connect();
    console.log("Conectado a MongoDB.");

    // Procesar mensajes de SQS
    await processMessagesFromSQS();
  } finally {
    // Cerrar conexión con MongoDB al finalizar
    await client.close();
    console.log("Conexión con MongoDB cerrada.");
  }
};

run().catch(console.error);
