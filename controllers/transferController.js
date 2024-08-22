const db = require('../config/config');
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
    const userId = req.userId; // Obtén el ID del usuario a partir del token JWT

    try {
        const query = `
            SELECT 
                transfers.id, 
                transfers.amount, 
                transfers.status, 
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
