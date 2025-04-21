function actualizarHabilidades() {
    var habilidadesAdquiridas = document.getElementById('habilidades-adquiridas').value;
    localStorage.setItem('habilidadesAdquiridas', habilidadesAdquiridas);
}

function cargarHabilidades() {
    var username = localStorage.getItem('username');
    if (!username) {
        alert('Debes iniciar sesión para cargar las habilidades.');
        return;
    }

    fetch(`/get-habilidades/${username}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                document.getElementById('habilidades-adquiridas').value = result.habilidades_adquiridas || '';
            } else {
                alert('No se encontraron las habilidades del usuario.');
            }
        })
        .catch(error => {
            console.error('Error al cargar las habilidades:', error);
            alert('Hubo un error al cargar las habilidades');
        });
}

function guardarHabilidades() {
    var habilidadesAdquiridas = document.getElementById('habilidades-adquiridas').value.trim();

    if (habilidadesAdquiridas === '') {
        alert('Por favor, ingrese algunas habilidades antes de guardar.');
        return;
    }

    const username = localStorage.getItem('username');
    
    if (!username) {
        alert('Debes iniciar sesión antes de guardar las habilidades.');
        return;
    }

    fetch('/actualizar-habilidades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            habilidades_adquiridas: habilidadesAdquiridas,
        }),
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            
        } else {
            alert('Hubo un error al guardar las habilidades: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Error al guardar habilidades:', error);
        alert('Hubo un error al guardar las habilidades');
    });
}

function sumar(caracteristica) {
    var elemento = document.getElementById(caracteristica);
    var valor = parseInt(elemento.textContent);
    valor += 1;
    elemento.textContent = valor;

    localStorage.setItem(caracteristica, valor);

    actualizarCaracteristicasEnBaseDeDatos(caracteristica, valor);
}

function restar(caracteristica) {
    var elemento = document.getElementById(caracteristica);
    var valor = parseInt(elemento.textContent);
    if (valor > 0) {
        valor -= 1;
        elemento.textContent = valor;

        localStorage.setItem(caracteristica, valor);

        actualizarCaracteristicasEnBaseDeDatos(caracteristica, valor);
    }
}


function actualizarCaracteristicasEnBaseDeDatos(caracteristica, valor) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Debes iniciar sesión para actualizar las características.');
        return;
    }

    const caracteristicas = [
        { nombre: 'carisma', valor: parseInt(document.getElementById('carisma').textContent) },
        { nombre: 'economia', valor: parseInt(document.getElementById('economia').textContent) },
        { nombre: 'torpeza', valor: parseInt(document.getElementById('torpeza').textContent) },
        { nombre: 'belleza', valor: parseInt(document.getElementById('belleza').textContent) },
        { nombre: 'social', valor: parseInt(document.getElementById('social').textContent) },
        { nombre: 'habilidad-inteligencia', valor: parseInt(document.getElementById('habilidad-inteligencia').textContent) },
        { nombre: 'habilidad-forma-fisica', valor: parseInt(document.getElementById('habilidad-forma-fisica').textContent) },
        { nombre: 'habilidad-zero', valor: parseInt(document.getElementById('habilidad-zero').textContent) },
        { nombre: 'habilidad-sigilo', valor: parseInt(document.getElementById('habilidad-sigilo').textContent) },
        { nombre: 'habilidad-reflejos', valor: parseInt(document.getElementById('habilidad-reflejos').textContent) },
        { nombre: 'habilidad-combate', valor: parseInt(document.getElementById('habilidad-combate').textContent) }
    ];

    fetch('/actualizar-caracteristica', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            caracteristicas: caracteristicas,
        }),
    })
    .then(response => response.json())
    .then(result => {
        if (!result.success) {
            alert('Hubo un error al actualizar las características.');
        }
    })
    .catch(error => {
        console.error('Error al actualizar la característica:', error);
        alert('Hubo un error al actualizar la característica.');
    });
}

function cargarCaracteristicas() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Debes iniciar sesión para cargar las características.');
        return;
    }

    fetch(`/get-caracteristicas/${username}`)
        .then(response => response.json())
        .then(result => {
            if (result.success && result.caracteristicas) {
                const caracteristicas = result.caracteristicas;
                for (const caracteristica of caracteristicas) {
                    const elemento = document.getElementById(caracteristica.nombre);
                    if (elemento) {
                        elemento.textContent = caracteristica.valor;
                        localStorage.setItem(caracteristica.nombre, caracteristica.valor);
                    }
                }
            } else {
                alert('Hubo un error al cargar las características.');
            }
        })
        .catch(error => {
            console.error('Error al cargar las características:', error);
        });
}

function cargarDesdeLocalStorage() {
    const caracteristicas = ['carisma', 'economia', 'torpeza', 'belleza', 'social', 'habilidad-inteligencia', 'habilidad-forma-fisica', 'habilidad-zero', 'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate'];

    caracteristicas.forEach(function(caracteristica) {
        var valor = localStorage.getItem(caracteristica);
        if (valor) {
            document.getElementById(caracteristica).textContent = valor;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarCaracteristicas();
    cargarHabilidades();
    cargarDados();
    cargarDesdeLocalStorage();
    cargarHabilidades();

    document.getElementById('guardar-habilidades-btn').addEventListener('click', guardarHabilidades);
    document.getElementById('habilidades-adquiridas').addEventListener('input', actualizarHabilidades);
});