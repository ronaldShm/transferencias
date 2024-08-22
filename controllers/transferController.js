const db = require('../config/config');
const Transfer = require('../models/Transfer');
const User = require('../models/User');

// Crear una transferencia
exports.createTransfer = async (req, res) => {
    const { recipientEmail, amount } = req.body;

    try {
        const sender = await User.findById(req.userId);
        if (!sender) {
            return res.status(404).json({ message: 'Usuario remitente no encontrado' });
        }

        if (sender.balance < amount) {
            return res.status(400).json({ message: 'Saldo insuficiente' });
        }

        const recipient = await User.findByEmail(recipientEmail);
        if (!recipient) {
            return res.status(404).json({ message: 'Usuario receptor no encontrado' });
        }

        const newTransfer = {
            sender_id: sender.id,
            receiver_id: recipient.id,
            amount,
            status: 'pending'
        };

        await Transfer.create(newTransfer);

        // No restar saldo aquí, solo confirmar creación
        return res.status(201).json({ message: 'Transferencia creada, pendiente de aprobación', currentBalance: sender.balance });
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
        const transfer = await Transfer.findById(transferId);
        if (!transfer) {
            return res.status(404).json({ message: 'Transferencia no encontrada' });
        }

        const { sender_id, receiver_id, amount } = transfer;

        if (status === 'approved') {
            const sender = await User.findById(sender_id);
            const receiver = await User.findById(receiver_id);

            if (!sender || !receiver) {
                return res.status(404).json({ message: 'Remitente o receptor no encontrado' });
            }

            const newSenderBalance = parseFloat(sender.balance) - parseFloat(amount);
            const newReceiverBalance = parseFloat(receiver.balance) + parseFloat(amount);

            if (newSenderBalance < 0) {
                return res.status(400).json({ message: 'Saldo insuficiente para aprobar la transferencia' });
            }

            console.log('Actualizando saldo del remitente:', typeof sender.id, 'Nuevo saldo:', typeof newSenderBalance);
            await User.updateBalance(sender.id, newSenderBalance);

            console.log('Actualizando saldo del receptor:', typeof receiver.id, 'Nuevo saldo:', typeof newReceiverBalance);
            await User.updateBalance(receiver.id, newReceiverBalance);

            await Transfer.updateStatus(transferId, status, reason);
            console.log('Saldo del receptor actualizado correctamente:', newReceiverBalance);

            return res.status(200).json({ message: 'Transferencia aprobada y saldos actualizados' });

        } else if (status === 'rejected') {
            await Transfer.updateStatus(transferId, status, reason);
            return res.status(200).json({ message: 'Transferencia rechazada', reason });
        }
    } catch (err) {
        console.error('Error al actualizar el estado de la transferencia:', err);
        return res.status(500).json({ message: 'Error al actualizar el estado de la transferencia' });
    }
};

// Obtener transferencias por ID de usuario
exports.getTransfersByUserId = async (req, res) => {
    const userId = req.userId; // Obtén el ID del usuario a partir del token JWT

    try {
        const query = `
            SELECT 
                transfers.id, 
                transfers.amount, 
                transfers.status, 
                transfers.reason, 
                receiver.first_name AS receiver_first_name, 
                receiver.last_name AS receiver_last_name, 
                receiver.email AS receiver_email
            FROM 
                transfers
            JOIN 
                users AS receiver ON transfers.receiver_id = receiver.id
            WHERE 
                transfers.sender_id = ?
        `;
        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error al obtener transferencias:', err);
                return res.status(500).json({ message: 'Error al obtener transferencias' });
            }
            res.status(200).json(results);
        });
    } catch (err) {
        console.error('Error al obtener transferencias:', err);
        return res.status(500).json({ message: 'Error al obtener transferencias' });
    }
};

// Obtener todas las transferencias pendientes
exports.getPendingTransfers = (req, res) => {
    const query = `
        SELECT 
            transfers.id, 
            transfers.amount, 
            transfers.status, 
            transfers.sender_id, 
            transfers.receiver_id, 
            sender.first_name AS sender_first_name, 
            sender.last_name AS sender_last_name, 
            receiver.first_name AS receiver_first_name, 
            receiver.last_name AS receiver_last_name
        FROM 
            transfers
        JOIN 
            users AS sender ON transfers.sender_id = sender.id
        JOIN 
            users AS receiver ON transfers.receiver_id = receiver.id
        WHERE 
            transfers.status = 'pending'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta de transferencias pendientes:', err);
            return res.status(500).json({ message: 'Error al obtener transferencias pendientes' });
        }
        res.status(200).json(results);
    });
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
