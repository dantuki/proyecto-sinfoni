const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // 1. Obtener el token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  // CORRECCIÓN CRÍTICA: Evita que los strings de JS "null", "undefined" o vacíos pasen como tokens reales
  if (!token || token === 'null' || token === 'undefined' || token === '') {
    return res.status(401).json({ 
      status: "error", 
      message: "Acceso denegado: No se proporcionó un token de sesión válido" 
    });
  }

  try {
    // 2. Verificar el token usando la clave secreta
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_archivex_2026');
    
    // Normalizamos el payload para asegurar que req.user siempre contenga 'id' y 'rol' de forma consistente
    req.user = {
      ...verified,
      id: verified.id || verified.sub,
      rol: verified.rol || verified.role || 'Docente'
    };
    
    next(); 
  } catch (error) {
    return res.status(403).json({ 
      status: "error", 
      message: "Token inválido o expirado" 
    });
  }
};

module.exports = verificarToken;