document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
        // Si es exitoso, almacena el token o username
        localStorage.setItem('token', result.token);  // Si usas token
        localStorage.setItem('username', username);  // O simplemente almacena el username

        // Redirige según la URL proporcionada por el backend
        window.location.href = result.redirectUrl;
    } else {
        document.getElementById('error-message').textContent = result.message;
    }
});