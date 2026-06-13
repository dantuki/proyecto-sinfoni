const express = require('express');
const router = express.Router();
const sedeController = require('../controllers/sedeController');

router.get('/', sedeController.getSedes);          // GET general (Listar)
router.get('/:id', sedeController.getSedeById);     // GET específico (Info)
router.post('/', sedeController.createSede);        // POST (Agregar)
router.put('/:id', sedeController.updateSede);      // PUT (Update)
router.delete('/:id', sedeController.deleteSede);   // DELETE (Borrar)

module.exports = router;