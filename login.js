require('dotenv').config();

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Usuario y contraseña predefinidos (desde variables de entorno)
    var predefinedUsername = process.env.USERNAME;
    var predefinedPassword = process.env.PASSWORD;

    if (username === predefinedUsername && password === predefinedPassword) {
        window.location.href = 'ficha.html'; // Redirige a ficha.html
    } else {
        document.getElementById('error-message').textContent = 'Usuario o contraseña incorrectos.';
    }
});