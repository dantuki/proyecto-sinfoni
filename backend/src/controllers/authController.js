const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarioModel');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verificar si el correo existe
        const user = await Usuario.getByEmail(email);
        if (!user) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        }

        // 2. Comparar la contraseña ingresada con la encriptada en la BD
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: "error", message: "Credenciales inválidas" });
        }

        // 3. Generar el Token (JWT)
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET || 'secreto_respaldo',
            { expiresIn: '4h' } // El token expira en 4 horas
        );

        // 4. Enviar respuesta exitosa sin mostrar la contraseña
        res.status(200).json({ 
            status: "success", 
            token, 
            user: { id: user.id, nombre: user.nombre_completo, rol: user.rol } 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error en el servidor", details: error.message });
    }
};

module.exports = { login };