// src/authConfig.js
export const msalConfig = {
  auth: {
    clientId: "TU_CLIENT_ID_DE_AZURE_AQUÍ", // El ID de la aplicación registrado en Azure
    authority: "https://login.microsoftonline.com/common", // 'common' para cualquier cuenta, o el Tenant ID de la U
    redirectUri: "http://localhost:5173", // La URL local de tu servidor de Vite/React
  },
  cache: {
    cacheLocation: "sessionStorage", // Guarda la sesión para que no se borre al recargar
    storeAuthStateInCookie: false,
  }
};

// Permisos básicos que le pediremos a Microsoft para leer los datos del usuario
export const loginRequest = {
  scopes: ["User.Read"]
};