const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');

router.get('/', convocatoriaController.getConvocatorias);          // GET general (Listar)
router.get('/:id', convocatoriaController.getConvocatoriaById);     // GET específico (Info)
router.post('/', convocatoriaController.createConvocatoria);        // POST (Agregar)
router.put('/:id', convocatoriaController.updateConvocatoria);      // PUT (Update)
router.delete('/:id', convocatoriaController.deleteConvocatoria);   // DELETE (Borrar)

module.exports = router;