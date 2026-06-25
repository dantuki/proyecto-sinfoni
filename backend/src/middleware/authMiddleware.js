const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Obtener el token del encabezado Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // El formato es "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ status: "error", message: "Acceso denegado: No se proporcionó token" });
    }

    try {
        // 2. Verificar el token usando la misma clave secreta del .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Guardamos la info del usuario (id y rol) en la request
        next(); // Si todo está bien, dejamos pasar a la ruta
    } catch (error) {
        res.status(403).json({ status: "error", message: "Token inválido o expirado" });
    }
};

module.exports = verificarToken;