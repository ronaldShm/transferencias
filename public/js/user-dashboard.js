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
// document.getElementById('transferForm').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const recipientEmail = document.getElementById('recipientEmail').value;
//     const amount = document.getElementById('amount').value;

//     try {
//         const token = localStorage.getItem('token');
//         const res = await fetch('/api/transfers/create', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify({ recipientEmail, amount })
//         });

//         if (!res.ok) {
//             const errorMessage = await res.json();
//             throw new Error(errorMessage.message || 'Error al crear la transferencia');
//         }

//         const data = await res.json();

//         alert('Transferencia creada, pendiente de aprobación');
//         document.getElementById('balance').innerText = `Tu saldo es: ${data.newBalance}`;
//     } catch (err) {
//         console.error('Error al realizar la transferencia:', err);
//         alert('Error al realizar la transferencia. Por favor, revisa los datos e inténtalo de nuevo.');
//     }
// });
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
            listItem.innerHTML = `
                <strong>ID:</strong> ${transfer.id} 
                <strong>Receptor:</strong> ${transfer.receiver_first_name} ${transfer.receiver_last_name} 
                <strong>Email:</strong> ${transfer.receiver_email} 
                <strong>Status:</strong> ${transfer.status} 
                <strong>Monto:</strong> ${transfer.amount}
            `;
            transferList.appendChild(listItem);
        });

    } catch (err) {
        console.error('Error al obtener los datos del usuario:', err);
    }
});