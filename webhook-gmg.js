require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint para recibir notificaciones de Mercado Libre
app.post('/webhook-gmg', (req, res) => {
    const notification = req.body;

    console.log('Notificación recibida:', notification);

    //Procesa la notificación
    processNotification(notification);

    res.status(200).send('OK'); // Importante responder con un 200
});


//Funcion para Procesar las notificaciones
function processNotification(notification){

    //Ejemplo de como puedes procesar el tipo de notificacion
    if(notification.topic == "messages"){
        console.log("Nuevo mensaje:", notification);
    } else if(notification.topic == "orders"){
        console.log("Nueva orden:", notification);
    } else if (notification.topic == "questions"){
        console.log("Nueva pregunta:", notification);
    }
     else {
       console.log("Notificacion desconocida: ", notification)
     }

    // Aquí puedes realizar acciones como:
    // - Guardar la información en una base de datos.
    // - Enviar un correo electrónico o notificación.
    // - Actualizar información en tu sistema.
    // - Etc.

    // Recuerda que debes verificar la autenticidad de la notificación antes de realizar acciones importantes.

}

app.listen(port, () => {
    console.log(`Servidor webhook escuchando en el puerto ${port}`);
});