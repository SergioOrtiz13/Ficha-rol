// Función para obtener el ID de la ficha
function obtenerFichaId() {
    const fichaId = document.getElementById('ficha-id').value;
    if (!fichaId) {
        console.error('Error: El ID de la ficha no está disponible. El valor de ficha-id es:', fichaId);
        alert('Ficha ID no disponible.');
        return null;
    }
    console.log('Ficha ID:', fichaId);  // Esto nos muestra el ID obtenido.
    return fichaId;
}

// Función para cargar las características desde la base de datos
function cargarCaracteristicas() {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    // Hacer una solicitud al servidor para obtener las características de la base de datos
    fetch(`/obtener-ficha/${fichaId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.caracteristicas) {
                const caracteristicas = data.caracteristicas;
                Object.keys(caracteristicas).forEach(function(caracteristica) {
                    const valor = caracteristicas[caracteristica];
                    if (valor) {
                        document.getElementById(caracteristica).textContent = valor;
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar características:', error);
        });
}

// Función para guardar las características en la base de datos
function guardarCaracteristicas() {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

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

    // Enviar los datos al servidor para actualizar la base de datos
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
            console.log('Características actualizadas correctamente');
        } else {
            console.error('Error al actualizar características');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Función para sumar una característica
function sumar(caracteristica) {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    const elemento = document.getElementById(caracteristica);
    let valor = parseInt(elemento.textContent);
    valor += 1;
    elemento.textContent = valor;

    // Enviar la actualización a la base de datos
    actualizarCaracteristicasEnBaseDeDatos(fichaId);
}

// Función para restar una característica
function restar(caracteristica) {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    const elemento = document.getElementById(caracteristica);
    let valor = parseInt(elemento.textContent);
    if (valor > 0) {
        valor -= 1;
        elemento.textContent = valor;

        // Enviar la actualización a la base de datos
        actualizarCaracteristicasEnBaseDeDatos(fichaId);
    }
}

// Función para actualizar las características en la base de datos
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

    // Enviar los datos al servidor para actualizar la base de datos
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

// Función para guardar habilidades adquiridas
function guardarHabilidades() {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    const habilidadesAdquiridas = document.getElementById('habilidades-adquiridas').value.trim();

    if (habilidadesAdquiridas === '') {
        alert('Por favor, ingrese algunas habilidades antes de guardar.');
        return;
    }

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

// Función para cargar habilidades adquiridas desde la base de datos
function cargarHabilidades() {
    const fichaId = obtenerFichaId();
    if (!fichaId) return;

    // Hacer una solicitud al servidor para obtener las habilidades adquiridas
    fetch(`/obtener-ficha/${fichaId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.habilidadesAdquiridas) {
                document.getElementById('habilidades-adquiridas').value = data.habilidadesAdquiridas;
            }
        })
        .catch(error => {
            console.error('Error al cargar habilidades:', error);
        });
}

// Cargar las características y habilidades cuando la página se haya cargado
document.addEventListener('DOMContentLoaded', function() {
    cargarCaracteristicas();
    cargarHabilidades();

    // Asociar eventos de los botones de sumar y restar características
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

    // Asociar el evento para guardar las habilidades
    document.getElementById('guardar-habilidades-btn').addEventListener('click', guardarHabilidades);
});

// Reemplazar saltos de línea en los párrafos de la historia
document.addEventListener('DOMContentLoaded', function() {
    var historiaElementos = document.querySelectorAll('.historia p');
    historiaElementos.forEach(function(historiaElemento) {
        historiaElemento.innerHTML = historiaElemento.innerHTML.replace(/\n/g, '<br>');
    });
});
