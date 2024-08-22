// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error(`Error al obtener los datos del usuario: ${res.statusText}`);
        }

        const data = await res.json();

        // Mostrar el nombre del usuario en la parte superior derecha
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = `Bienvenido, ${data.first_name}`;

        // Mostrar el balance u otra información según sea necesario
        document.getElementById('balance').textContent = `Tu saldo es: ${data.balance}`;
    } catch (err) {
        console.error('Error al obtener los datos del usuario:', err);
        alert('Error al obtener los datos del usuario. Por favor, inténtalo de nuevo más tarde.');
    }
});

// Manejador del botón de cierre de sesión
document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});

// Manejador del formulario de transferencia
document.getElementById('transferForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const recipientEmail = document.getElementById('recipientEmail').value;
    const amount = document.getElementById('amount').value;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/transfers/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipientEmail, amount })
        });

        const data = await res.json();
        if (res.status === 201) {
            alert('Transferencia creada, pendiente de aprobación');
            // Actualizar la vista del balance con el saldo actual
            document.getElementById('balance').innerText = `Tu saldo es: ${data.currentBalance}`;
            // Limpiar los campos después de la transferencia exitosa
            document.getElementById('recipientEmail').value = '';
            document.getElementById('amount').value = '';
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Error al realizar la transferencia:', err);
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');

        // Obtener datos del usuario
        const resUser = await fetch('/api/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resUser.ok) {
            throw new Error(`Error al obtener los datos del usuario: ${resUser.statusText}`);
        }

        const userData = await resUser.json();
        document.getElementById('welcomeMessage').textContent = `Bienvenido, ${userData.first_name}`;
        document.getElementById('balance').textContent = `Tu saldo es: ${userData.balance}`;

        // Obtener transacciones del usuario
        const resTransfers = await fetch('/api/transfers/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resTransfers.ok) {
            throw new Error('Error al obtener las transacciones del usuario');
        }

        const transfers = await resTransfers.json();
        const transferList = document.getElementById('transferList');
        transferList.innerHTML = '';

        transfers.forEach(transfer => {
            const listItem = document.createElement('li');

            // Añadir la clase según el estado de la transferencia
            if (transfer.status === 'approved') {
                listItem.classList.add('approved');
            } else if (transfer.status === 'rejected') {
                listItem.classList.add('rejected');
            }

            listItem.innerHTML = `
                <strong>ID:</strong> ${transfer.id} 
                <strong>Receptor:</strong> ${transfer.receiver_first_name} ${transfer.receiver_last_name} 
                <strong>Email:</strong> ${transfer.receiver_email} 
                <strong>Status:</strong> ${transfer.status} 
                <strong>Monto:</strong> ${transfer.amount}
                <strong>Motivo:</strong> ${transfer.reason ? transfer.reason : 'N/A'}
            `;

            transferList.appendChild(listItem);
        });

    } catch (err) {
        console.error('Error al obtener los datos del usuario:', err);
    }
});