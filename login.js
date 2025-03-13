// login.js
import './config.js';

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    console.log('Username:', username);
    console.log('Password:', password);

    if (predefinedUsers[username] && predefinedUsers[username] === password) {
        if (username === 'Sergio') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'ficha.html';
        }
    } else {
        document.getElementById('error-message').textContent = 'Usuario o contraseña incorrectos.';
    }
});