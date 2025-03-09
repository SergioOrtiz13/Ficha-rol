document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('config.json')
        .then(response => response.json())
        .then(config => {
            var predefinedUsername = config.username;
            var predefinedPassword = config.password;

            if (username === predefinedUsername && password === predefinedPassword) {
                window.location.href = 'ficha.html'; // Redirige a ficha.html
            } else {
                document.getElementById('error-message').textContent = 'Usuario o contraseña incorrectos.';
            }
        })
        .catch(error => {
            console.error('Error al cargar el archivo de configuración:', error);
        });
});