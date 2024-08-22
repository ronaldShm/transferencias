const Transfer = require('../models/Transfer');
const User = require('../models/User');

// Crear una transferencia
exports.createTransfer = async (req, res) => {
    const { recipientEmail, amount } = req.body;

    try {
        // Verificar remitente
        const sender = await User.findById(req.userId);
        console.log('Remitente encontrado:', sender);  // <-- Agrega esto para verificar
        if (!sender) {
            return res.status(404).json({ message: 'Usuario remitente no encontrado' });
        }

        // Verificar si el remitente tiene suficiente saldo
        if (sender.balance < amount) {
            return res.status(400).json({ message: 'Saldo insuficiente' });
        }

        // Verificar receptor
        const recipient = await User.findByEmail(recipientEmail);
        if (!recipient) {
            return res.status(404).json({ message: 'Usuario receptor no encontrado' });
        }

        // Crear la transferencia
        const newTransfer = {
            sender_id: sender.id,
            receiver_id: recipient.id,
            amount,
            status: 'pending'
        };

        const result = await Transfer.create(newTransfer);
        console.log('Transferencia creada:', result);

        // Actualizar saldo del remitente
        const updatedBalance = sender.balance - amount;
        await User.updateBalance(sender.id, updatedBalance);

        return res.status(201).json({ message: 'Transferencia creada, pendiente de aprobación', newBalance: updatedBalance });
    } catch (err) {
        console.error('Error en la creación de la transferencia:', err);
        return res.status(500).json({ message: 'Error en el servidor al crear la transferencia' });
    }
};

// Aprobar o rechazar una transferencia
exports.approveTransfer = async (req, res) => {
    const { transferId, status, reason } = req.body;

    if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: 'Estado de transferencia inválido' });
    }

    try {
        // Obtener los detalles de la transferencia
        const transfer = await Transfer.findById(transferId);
        if (!transfer) {
            return res.status(404).json({ message: 'Transferencia no encontrada' });
        }

        const { sender_id, receiver_id, amount } = transfer;

        if (status === 'approved') {
            // Obtener los usuarios
            const sender = await User.findById(sender_id);
            const receiver = await User.findById(receiver_id);

            if (!sender || !receiver) {
                return res.status(404).json({ message: 'Remitente o receptor no encontrado' });
            }

            // Actualizar saldos
            await User.updateBalance(sender.id, sender.balance - amount);
            await User.updateBalance(receiver.id, receiver.balance + amount);

            // Actualizar estado de la transferencia
            await Transfer.updateStatus(transferId, 'approved', reason);

            return res.status(200).json({ message: 'Transferencia aprobada y saldos actualizados' });
        } else if (status === 'rejected') {
            // Revertir el saldo al remitente
            const sender = await User.findById(sender_id);
            if (!sender) {
                return res.status(404).json({ message: 'Remitente no encontrado' });
            }

            await User.updateBalance(sender.id, sender.balance + amount);

            // Actualizar estado de la transferencia
            await Transfer.updateStatus(transferId, 'rejected', reason);

            return res.status(200).json({ message: 'Transferencia rechazada y saldo devuelto' });
        }
    } catch (err) {
        console.error('Error al procesar la transferencia:', err);
        return res.status(500).json({ message: 'Error al procesar la transferencia' });
    }
};

// Obtener transferencias por ID de usuario
exports.getTransfersByUserId = async (req, res) => {
    const userId = req.params.id;

    try {
        const transfers = await Transfer.getByUserId(userId);
        return res.status(200).json(transfers);
    } catch (err) {
        console.error('Error al obtener transferencias:', err);
        return res.status(500).json({ message: 'Error al obtener transferencias' });
    }
};

// Obtener todas las transferencias pendientes
exports.getPendingTransfers = async (req, res) => {
    try {
        const transfers = await Transfer.findByStatus('pending');
        if (!transfers || transfers.length === 0) {
            return res.status(200).json([]);  // Devuelve un array vacío si no hay transferencias pendientes
        }

        return res.status(200).json(transfers);  // Devuelve las transferencias pendientes en formato JSON
    } catch (err) {
        console.error('Error al obtener transferencias pendientes:', err);
        return res.status(500).json({ message: 'Error al obtener transferencias pendientes' });
    }
};

// Obtener todas las transferencias
exports.getAllTransfers = async (req, res) => {
    try {
        const transfers = await Transfer.findAll();
        if (!transfers || transfers.length === 0) {
            return res.status(200).json([]);  // Devuelve un array vacío si no hay transferencias
        }

        return res.status(200).json(transfers);  // Devuelve las transferencias en formato JSON
    } catch (err) {
        console.error('Error al obtener transferencias:', err);
        return res.status(500).json({ message: 'Error al obtener transferencias' });
    }
};
