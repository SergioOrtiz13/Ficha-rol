function tirarDados() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }
    document.getElementById('resultado-dados').textContent = 'Resultados de tus dados: ' + resultados.join(', ');

    // Aquí enviamos los resultados al backend para actualizar las tiradas en la base de datos
    const username = 'Kike';  // O el username del usuario que está jugando
    fetch('/actualizar-tiradas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            tiradas: resultados,  // Enviamos el array de números al backend
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
