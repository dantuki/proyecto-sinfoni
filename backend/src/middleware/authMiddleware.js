import jwt from 'jsonwebtoken';
import axios from 'axios';

// MIDDLEWARE: Verificación de Token Bearer
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// MIDDLEWARE: Validación Desacoplada de reCAPTCHA
export const verifyCaptcha = async (req, res, next) => {
  if (process.env.RECAPTCHA_ENABLED !== 'true') {
    return next(); // Si está desactivado en el .env, pasa sin validar
  }

  const token = req.body.captchaToken;
  if (!token) {
    return res.status(400).json({ error: 'Validación CAPTCHA requerida.' });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
    );

    if (response.data.success) {
      next();
    } else {
      return res.status(400).json({ error: 'Validación de seguridad CAPTCHA fallida.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar el CAPTCHA con el servidor de Google.' });
  }
};

// MIDDLEWARE: Control de Roles Dinámico
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: `Acceso restringido. Se requiere rol: [${allowedRoles.join(', ')}]. Tu rol actual es: [${req.user?.rol || 'Ninguno'}]` 
      });
    }
    next();
  };
};