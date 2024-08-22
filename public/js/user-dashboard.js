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
    }
});

document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});

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
            document.getElementById('balance').innerText = `Tu saldo es: ${data.newBalance}`;
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Error al realizar la transferencia:', err);
    }
});

// document.getElementById('logoutButton').addEventListener('click', () => {
//     // Eliminar el token del almacenamiento local
//     localStorage.removeItem('token');

//     // Redirigir a la página de inicio de sesión
//     window.location.href = '/';
// });