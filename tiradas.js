function tirarDados() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }
    document.getElementById('resultado-dados').textContent = 'Resultados de tus dados: ' + resultados.join(', ');

    // Obtener el username desde localStorage
    const username = localStorage.getItem('username'); 

    // Si no hay username guardado, significa que no hay usuario logeado
    if (!username) {
        console.log('Error: No se encontró el username. El usuario no está logeado.');
        return;  // O podrías redirigir al login
    }

    // Enviar las tiradas al backend para actualizar las tiradas del usuario logeado
    fetch('/actualizar-tiradas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,  // Aquí pasamos el username dinámico
            tiradas: resultados,  // Enviamos el array de tiradas
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Tiradas actualizadas correctamente');
        } else {
            console.log('Error al actualizar las tiradas');
        }
    })
    .catch(error => console.error('Error:', error));
}
