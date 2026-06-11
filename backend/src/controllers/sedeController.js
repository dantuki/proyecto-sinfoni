const Sede = require('../models/sedeModel');

const getSedes = async (req, res) => {
    try {
        const sedes = await Sede.getAll();
        res.status(200).json({
            status: "success",
            data: sedes
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error interno al obtener las sedes",
            details: error.message
        });
    }
};

module.exports = {
    getSedes
};