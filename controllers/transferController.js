const Transfer = require('../models/Transfer');
const User = require('../models/User');

// Crear una transferencia
exports.createTransfer = async (req, res) => {
    const { recipientEmail, amount } = req.body;

    try {
        // Verificar remitente
        const senderResult = await User.findById(req.userId);
        if (!senderResult || senderResult.length === 0) {
            return res.status(404).json({ message: 'Usuario remitente no encontrado' });
        }

        const sender = senderResult[0];
        if (sender.balance < amount) {
            return res.status(400).json({ message: 'Saldo insuficiente' });
        }

        // Verificar receptor
        const recipientResult = await User.findByEmail(recipientEmail);
        if (!recipientResult || recipientResult.length === 0) {
            return res.status(404).json({ message: 'Usuario receptor no encontrado' });
        }

        const recipient = recipientResult[0];

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

    // Validar el estado
    if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: 'Estado de transferencia inválido' });
    }

    try {
        // Actualizar estado de la transferencia
        await Transfer.updateStatus(transferId, status, reason);

        if (status === 'approved') {
            // Obtener los detalles de la transferencia
            const transfer = await Transfer.findById(transferId);
            if (!transfer || transfer.length === 0) {
                return res.status(404).json({ message: 'Transferencia no encontrada' });
            }

            const { sender_id, receiver_id, amount } = transfer[0];

            // Actualizar saldo del remitente
            const senderResult = await User.findById(sender_id);
            const receiverResult = await User.findById(receiver_id);

            if (!senderResult || !receiverResult || senderResult.length === 0 || receiverResult.length === 0) {
                return res.status(404).json({ message: 'Remitente o receptor no encontrado' });
            }

            const sender = senderResult[0];
            const receiver = receiverResult[0];

            await User.updateBalance(sender.id, sender.balance - amount);
            await User.updateBalance(receiver.id, receiver.balance + amount);

            return res.status(200).json({ message: 'Transferencia aprobada y saldos actualizados' });
        } else if (status === 'rejected') {
            return res.status(200).json({ message: 'Transferencia rechazada', reason });
        }
    } catch (err) {
        console.error('Error al actualizar el estado de la transferencia:', err);
        return res.status(500).json({ message: 'Error al actualizar el estado de la transferencia' });
    }
};

// Obtener transferencias por ID de usuario
exports.getTransfersByUserId = async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await Transfer.getByUserId(userId);
        return res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener transferencias:', err);
        return res.status(500).json({ message: 'Error al obtener transferencias' });
    }
};

// Obtener todas las transferencias pendientes
exports.getPendingTransfers = (req, res) => {
    Transfer.findByStatus('pending', (err, transfers) => {
        if (err) {
            console.error('Error al obtener transferencias pendientes:', err);
            return res.status(500).json({ message: 'Error al obtener transferencias pendientes' });
        }

        if (!transfers || transfers.length === 0) {
            return res.status(200).json([]);  // Devuelve un array vacío si no hay transferencias pendientes
        }

        res.status(200).json(transfers);  // Devuelve las transferencias pendientes en formato JSON
    });
};

// Obtener todas las transferencias
exports.getAllTransfers = (req, res) => {
    Transfer.findAll((err, transfers) => {
        if (err) {
            console.error('Error al obtener transferencias:', err);
            return res.status(500).json({ message: 'Error al obtener transferencias' });
        }

        if (!transfers || transfers.length === 0) {
            return res.status(200).json([]);  // Devuelve un array vacío si no hay transferencias
        }

        res.status(200).json(transfers);  // Devuelve las transferencias en formato JSON
    });
};