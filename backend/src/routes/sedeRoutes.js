const express = require('express');
const router = express.Router();
const SedeController = require('../controllers/sedeController');

router.get('/', SedeController.getSedes);          // GET general (Listar)
router.get('/:id', SedeController.getSedeById);     // GET específico (Info)
router.post('/', SedeController.createSede);        // POST (Agregar)
router.put('/:id', SedeController.updateSede);      // PUT (Update)
router.delete('/:id', SedeController.deleteSede);   // DELETE (Borrar)

module.exports = router;