function recuperarTiradas(username) {
    fetch(`/tiradas/${username}`)
        .then(response => response.json())
        .then(tiradas => {
            const resultadoDadosDiv = document.getElementById('resultado-dados');
            resultadoDadosDiv.innerHTML = '';

            if (tiradas.length === 0) {
                resultadoDadosDiv.innerHTML = '<p>No tienes tiradas previas.</p>';
            } else {
                const ultima = tiradas[0]; 
                const tiradaDiv = document.createElement('div');
                tiradaDiv.textContent = `Usuario: ${username} - Tirada: ${ultima.resultado.join(', ')}`;
                resultadoDadosDiv.appendChild(tiradaDiv);
            }
        })
        .catch(error => {
            console.error('Error al obtener las tiradas:', error);
        });
}

function tirarDadosJugador() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }

    document.getElementById('resultado-dados').textContent = ' ' + resultados.join(', ');

    localStorage.setItem('resultadosTiradaJugador', JSON.stringify(resultados));

    const username = localStorage.getItem('username');

    if (username) {
        guardarTiradaEnBD(username, resultados);

        recuperarTiradas(username);
    }
}

function guardarTiradaEnBD(username, resultados) {
    fetch('/guardar-tirada', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,  
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

function mostrarUltimasTiradasGlobales() {
    fetch('/tiradas')
        .then(response => response.json())
        .then(tiradas => {
            const resultadoDiv = document.getElementById('resultado-dados');
            resultadoDiv.innerHTML = '<h3>Últimas tiradas:</h3>';

            if (tiradas.length === 0) {
                resultadoDiv.innerHTML += '<p>No hay tiradas aún.</p>';
                return;
            }

            const lista = document.createElement('ul');
            tiradas.forEach(t => {
                const item = document.createElement('li');
                item.textContent = `${t._id}: ${t.ultimaTirada.join(', ')}`;
                lista.appendChild(item);
            });

            resultadoDiv.appendChild(lista);
        })
        .catch(error => {
            console.error('Error al obtener tiradas globales:', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username'); 
    if (username) {
        guardarTiradaEnBD(username, resultados);
        recuperarTiradas(username);
        mostrarUltimasTiradasGlobales();
    } else {
        console.error('No se encontró el nombre de usuario en localStorage');
    }
});