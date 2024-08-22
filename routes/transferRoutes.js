const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const transferController = require('../controllers/transferController');

// Ruta para obtener todas las transferencias (solo para administradores)
router.get('/all', authMiddleware.verifyToken, authMiddleware.isAdmin, transferController.getAllTransfers);

// Ruta para obtener transferencias pendientes (solo para administradores)
router.get('/pending', authMiddleware.verifyToken, authMiddleware.isAdmin, transferController.getPendingTransfers);

// Ruta para crear una transferencia
router.post('/create', authMiddleware.verifyToken, transferController.createTransfer);

// Ruta para aprobar o rechazar una transferencia (solo para administradores)
router.put('/approve', authMiddleware.verifyToken, authMiddleware.isAdmin, transferController.approveTransfer);

// Ruta para obtener las transferencias de un usuario específico
router.get('/:id', authMiddleware.verifyToken, transferController.getTransfersByUserId);


module.exports = router;
