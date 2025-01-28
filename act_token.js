require('dotenv').config(); // Para leer el archivo .env
const fs = require('fs');
const axios = require('axios');

// Endpoint de MercadoLibre para renovar el token
const REFRESH_TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';

// Función para renovar el token
async function renewToken() {
  try {
    // Leer los valores actuales desde el archivo .env
    const clientId = process.env.CLIENT_ID; // ID de tu aplicación
    const clientSecret = process.env.CLIENT_SECRET; // Secreto de tu aplicación
    const refreshToken = process.env.REFRESH_TOKEN; // Refresh token actual

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Faltan CLIENT_ID, CLIENT_SECRET o REFRESH_TOKEN en el archivo .env');
    }

    // Realizar la solicitud POST para renovar el token
    const response = await axios.post(REFRESH_TOKEN_URL, null, {
      params: {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Extraer los nuevos tokens de la respuesta
    const newAccessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;

    console.log('Token renovado exitosamente:');
    console.log('ACCESS_TOKEN:', newAccessToken);
    console.log('REFRESH_TOKEN:', newRefreshToken);

    // Actualizar el archivo .env con los nuevos tokens
    updateEnvFile({
      ACCESS_TOKEN: newAccessToken,
      REFRESH_TOKEN: newRefreshToken
    });
  } catch (error) {
    console.error('Error al renovar el token:', error.message);
  }
}

// Función para actualizar el archivo .env
function updateEnvFile(newValues) {
  const envFilePath = '.env';
  const envContent = fs.readFileSync(envFilePath, 'utf8');

  // Actualizar las líneas del archivo .env con los nuevos valores
  const updatedEnvContent = envContent
    .split('\n')
    .map(line => {
      if (line.startsWith('ACCESS_TOKEN=')) {
        return `ACCESS_TOKEN=${newValues.ACCESS_TOKEN}`;
      }
      if (line.startsWith('REFRESH_TOKEN=')) {
        return `REFRESH_TOKEN=${newValues.REFRESH_TOKEN}`;
      }
      return line;
    })
    .join('\n');

  // Sobrescribir el archivo .env
  fs.writeFileSync(envFilePath, updatedEnvContent, 'utf8');
  console.log('Archivo .env actualizado con los nuevos tokens');
}

// Programar la renovación automática cada 6 horas (21600000 ms)
setInterval(renewToken, 21600000); // 6 horas en milisegundos

// Llamar a la función inmediatamente al inicio para la primera renovación
renewToken();