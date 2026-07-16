const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // 1. Obtener el token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ status: "error", message: "Acceso denegado: No se proporcionó token" });
  }

  try {
    // 2. Verificar el token usando la clave secreta
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Guardamos la info decodificada (que debe traer id y rol) en el objeto request
    req.user = verified; 
    next(); 
  } catch (error) {
    res.status(403).json({ status: "error", message: "Token inválido o expirado" });
  }
};

module.exports = verificarToken;