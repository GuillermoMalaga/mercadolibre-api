const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3001;

var accessToken;

// Función para obtener los mensajes
async function fetchMessages(userId, accessToken) {
  try {
    const response = await axios.get(
      `https://api.mercadolibre.com/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
}

// Ruta para obtener los mensajes de un usuario
app.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  dotenv.config({ override: true });
  accessToken = process.env.ACCESS_TOKEN;
  try {
    const messages = await fetchMessages(userId, accessToken);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
