// Función para guardar la información de autenticación en localStorage
function guardarAuthInfo(username, token) {
    // Guardamos tanto el username como el token en localStorage
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);
    console.log('Usuario y token guardados en localStorage');
}

// Función para recuperar la información de autenticación desde localStorage
function recuperarAuthInfo() {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (username && token) {
        console.log('Información de autenticación recuperada: ', username);
        return { username, token };
    }

    console.log('No se encontró información de autenticación');
    return null;
}

// Función para eliminar la información de autenticación (cuando el usuario cierre sesión)
function eliminarAuthInfo() {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    console.log('Información de autenticación eliminada');
}

// Función para verificar si el token sigue siendo válido
function verificarTokenValido(token) {
    // Aquí deberías agregar lógica para verificar si el token sigue siendo válido.
    // Por ejemplo, podrías enviar una solicitud al servidor para validar el token.

    // En este ejemplo, supondremos que el token es válido si está presente.
    return token !== null;
}

// Función para manejar el login
function login(username, password) {
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Respuesta del servidor:", data); // Verifica la respuesta
        if (data.success && data.token) {
            guardarAuthInfo(username, data.token);
            if (data.redirectUrl) {
                console.log("Redirigiendo a: ", data.redirectUrl);
                window.location.href = data.redirectUrl; // Redirige según el URL recibido
            } else {
                console.error('No se proporcionó la URL de redirección.');
            }
        } else {
            console.log('Error de autenticación:', data.message);
        }
    })
    .catch(error => {
        console.error('Error al conectar con el servidor:', error);
    });
}


// Función para manejar el logout
function logout() {
    eliminarAuthInfo();
    window.location.href = '/login';  // Redirigir al login después de cerrar sesión
}

// Exportar las funciones necesarias para usarlas en otros archivos
export { guardarAuthInfo, recuperarAuthInfo, eliminarAuthInfo, verificarTokenValido, login, logout };
