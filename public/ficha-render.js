function obtenerFichaId() {
    // Asumimos que hay un elemento en la página con el ID 'ficha-id' que contiene el ID único de la ficha.
    const fichaId = document.getElementById('ficha-id').value;
    if (!fichaId) {
        console.error('Error: El ID de la ficha no está disponible. El valor de ficha-id es:', fichaId);
        alert('Ficha ID no disponible.');
        return null;
    }
    console.log('Ficha ID:', fichaId);  // Esto nos muestra el ID obtenido.
    return fichaId;
}

// Función para cargar las características desde el localStorage
function cargarCaracteristicas() {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    const caracteristicas = [
        'carisma', 'economia', 'torpeza', 'belleza', 'social',
        'habilidad-inteligencia', 'habilidad-forma-fisica', 'habilidad-zero',
        'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate'
    ];

    caracteristicas.forEach(function(caracteristica) {
        const valor = localStorage.getItem(`${fichaId}-${caracteristica}`);
        if (valor) {
            document.getElementById(caracteristica).textContent = valor;
        }
    });
}

// Función para guardar las características en el localStorage
function guardarCaracteristicas() {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    const caracteristicas = [
        'carisma', 'economia', 'torpeza', 'belleza', 'social',
        'habilidad-inteligencia', 'habilidad-forma-fisica', 'habilidad-zero',
        'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate'
    ];

    caracteristicas.forEach(function(caracteristica) {
        const valor = document.getElementById(caracteristica).textContent;
        localStorage.setItem(`${fichaId}-${caracteristica}`, valor);
    });
}

function sumar(caracteristica) {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    const elemento = document.getElementById(caracteristica);
    let valor = parseInt(elemento.textContent);
    valor += 1;
    elemento.textContent = valor;

    localStorage.setItem(`${fichaId}-${caracteristica}`, valor);

    // Enviar la actualización a la base de datos
    actualizarCaracteristicasEnBaseDeDatos(fichaId);
}

function restar(caracteristica) {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    const elemento = document.getElementById(caracteristica);
    let valor = parseInt(elemento.textContent);
    if (valor > 0) {
        valor -= 1;
        elemento.textContent = valor;

        localStorage.setItem(`${fichaId}-${caracteristica}`, valor);

        // Enviar la actualización a la base de datos
        actualizarCaracteristicasEnBaseDeDatos(fichaId);
    }
}

function actualizarCaracteristicasEnBaseDeDatos(fichaId) {
    const caracteristicas = [
        'carisma', 'economia', 'torpeza', 'belleza', 'social',
        'habilidad-inteligencia', 'habilidad-forma-fisica', 'habilidad-zero',
        'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate'
    ];

    const datosActualizados = {};

    caracteristicas.forEach(function(caracteristica) {
        const valor = document.getElementById(caracteristica).textContent;
        datosActualizados[caracteristica] = valor;
    });

    // Enviar los datos al servidor
    fetch(`/actualizar-ficha/${fichaId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizados)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Ficha actualizada correctamente');
        } else {
            console.error('Error al actualizar la ficha');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function guardarHabilidades() {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    const habilidadesAdquiridas = document.getElementById('habilidades-adquiridas').value.trim();

    if (habilidadesAdquiridas === '') {
        alert('Por favor, ingrese algunas habilidades antes de guardar.');
        return;
    }

    // Guardar las habilidades adquiridas en el localStorage
    localStorage.setItem(`${fichaId}-habilidadesAdquiridas`, habilidadesAdquiridas);

    // Enviar las habilidades adquiridas al servidor
    actualizarHabilidadesEnBaseDeDatos(fichaId, habilidadesAdquiridas);
}

function actualizarHabilidadesEnBaseDeDatos(fichaId, habilidadesAdquiridas) {
    // Enviar las habilidades adquiridas al servidor
    fetch(`/actualizar-ficha/${fichaId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ habilidadesAdquiridas: habilidadesAdquiridas })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Habilidades actualizadas correctamente');
        } else {
            console.error('Error al actualizar habilidades');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Función para cargar las habilidades adquiridas desde el localStorage
function cargarHabilidades() {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    const habilidadesAdquiridas = localStorage.getItem(`${fichaId}-habilidadesAdquiridas`);
    if (habilidadesAdquiridas) {
        document.getElementById('habilidades-adquiridas').value = habilidadesAdquiridas;
    }
}

function cargarTiradas() {
    const fichaId = obtenerFichaId(); // Obtener el ID del usuario logueado
    if (!fichaId) return;

    // Llama a la API para obtener las tiradas
    fetch(`/get-tiradas/${fichaId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tiradas = data.tiradas;
                // Muestra las tiradas del usuario logueado
                document.getElementById('resultado-dados').textContent = `Resultado de tus dados: ${tiradas.join(', ')}`;
            } else {
                console.error('No se pudieron cargar las tiradas');
            }
        })
        .catch(error => {
            console.error('Error al obtener las tiradas:', error);
        });
}

function cargarTiradasOtrosJugadores() {
    // Suponiendo que tienes una lista de otros jugadores logueados en tu aplicación
    // O podrías hacer una llamada para obtener los jugadores de la misma partida.
    const jugadores = ['jugador1', 'jugador2', 'jugador3']; // Ejemplo, reemplaza con tus datos reales

    jugadores.forEach(username => {
        fetch(`/get-tiradas/${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tiradas = data.tiradas;
                    const div = document.createElement('div');
                    div.textContent = `Resultado de ${username}: ${tiradas.join(', ')}`;
                    document.getElementById('tirada-otros-jugadores').appendChild(div);
                } else {
                    console.error('No se pudieron cargar las tiradas de', username);
                }
            })
            .catch(error => {
                console.error('Error al obtener las tiradas:', error);
            });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarCaracteristicas();
    cargarHabilidades();
    cargarTiradas();
    cargarTiradasOtrosJugadores();

    // Asociar eventos de los botones
    const caracteristicas = ['carisma', 'economia', 'torpeza', 'belleza', 'social', 
                             'habilidad-inteligencia', 'habilidad-forma-fisica', 'habilidad-zero', 
                             'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate'];
                             

    caracteristicas.forEach(function(caracteristica) {
        document.getElementById(`${caracteristica}-sumar`).addEventListener('click', function() {
            sumar(caracteristica);
        });
        document.getElementById(`${caracteristica}-restar`).addEventListener('click', function() {
            restar(caracteristica);
        });
    });

    document.getElementById('guardar-habilidades-btn').addEventListener('click', guardarHabilidades);
});

document.addEventListener('DOMContentLoaded', function() {
    // Selecciona todos los elementos <p> dentro de .historia
    var historiaElementos = document.querySelectorAll('.historia p');

    // Itera sobre cada uno de los párrafos
    historiaElementos.forEach(function(historiaElemento) {
        // Reemplaza los saltos de línea (\n) por <br> en el contenido HTML de cada párrafo
        historiaElemento.innerHTML = historiaElemento.innerHTML.replace(/\n/g, '<br>');
    });
});