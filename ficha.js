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
                // Asegúrate de que el campo 'habilidades_adquiridas' esté presente
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

    // Enviar las habilidades al servidor
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
    elemento.textContent = valor + 1;
    localStorage.setItem(caracteristica, valor + 1);
}

function restar(caracteristica) {
    var elemento = document.getElementById(caracteristica);
    var valor = parseInt(elemento.textContent);
    if (valor > 0) {
        elemento.textContent = valor - 1;
        localStorage.setItem(caracteristica, valor - 1);
    }
}

function cargarCaracteristicas() {
    var caracteristicas = ['carisma', 'economia', 'torpeza', 'inteligencia', 'social', 'habilidad-inteligencia', 'habilidad-forma-fisica', 'habilidad-zero', 'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate'];
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

    // Evento para el botón "Guardar Habilidades"
    document.getElementById('guardar-habilidades-btn').addEventListener('click', guardarHabilidades);
    document.getElementById('habilidades-adquiridas').addEventListener('input', actualizarHabilidades);
});
