const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');

router.get('/', solicitudController.getSolicitudes);          // GET general (Listar)
router.get('/:id', solicitudController.getSolicitudById);     // GET específico (Info)
router.post('/', solicitudController.createSolicitud);        // POST (Agregar)
router.put('/:id', solicitudController.updateSolicitud);      // PUT (Update)
router.delete('/:id', solicitudController.deleteSolicitud);   // DELETE (Borrar)

module.exports = router;