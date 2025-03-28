// Función para recuperar las tiradas previas del usuario
function recuperarTiradas(username) {
    fetch(`/tiradas/${username}`)
        .then(response => response.json())
        .then(tiradas => {
            const resultadoDadosDiv = document.getElementById('resultado-dados');
            resultadoDadosDiv.innerHTML = '';  // Limpiar el contenido previo

            if (tiradas.length === 0) {
                resultadoDadosDiv.innerHTML = '<p>No tienes tiradas previas.</p>';
            } else {
                // Solo mostramos la última tirada
                const ultimaTirada = tiradas[0];  // La más reciente está al principio de la lista
                const tiradaDiv = document.createElement('div');
                tiradaDiv.textContent = `${ultimaTirada.resultado.join(', ')}`;
                resultadoDadosDiv.appendChild(tiradaDiv);
            }
        })
        .catch(error => {
            console.error('Error al obtener las tiradas:', error);
        });
}

// Función para tirar los dados y actualizar el resultado del jugador actual
function tirarDadosJugador() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }

    // Mostrar el resultado en el frontend
    document.getElementById('resultado-dados').textContent = ' ' + resultados.join(', ');

    // Guardar los resultados en localStorage
    localStorage.setItem('resultadosTiradaJugador', JSON.stringify(resultados));

    // Obtener el username desde el localStorage
    const username = localStorage.getItem('username');

    if (username) {
        // Guardar la nueva tirada en la base de datos
        guardarTiradaEnBD(username, resultados);

        // Actualizar las tiradas previas del usuario
        recuperarTiradas(username);
    }
}

// Función para guardar la tirada en la base de datos
function guardarTiradaEnBD(username, resultados) {
    fetch('/guardar-tirada', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,  // Siempre usas el username correcto
            resultados: resultados
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Tirada guardada correctamente:', data.message);
        } else {
            console.log('Error al guardar la tirada:', data.message);
        }
    })
    .catch(error => {
        console.error('Error al conectar con el servidor:', error);
    });
}

// Al cargar la página, recuperamos el username desde localStorage y las tiradas previas
document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');  // Obtener el username desde localStorage
    if (username) {
        // Recuperar y mostrar las tiradas previas
        recuperarTiradas(username);
    } else {
        console.error('No se encontró el nombre de usuario en localStorage');
    }
});
