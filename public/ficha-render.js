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
  'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate',
  'habilidad-percepcion', 'habilidad-subterfugio', 'habilidad-juegoDeManos', 
  'habilidad-Voluntad'
];

    const datosActualizados = {
        habilidades: {}  // Aquí es donde guardamos las habilidades
    };

    // Recopilamos todas las características para actualizarlas
    caracteristicas.forEach(function(caracteristica) {
        const valor = document.getElementById(caracteristica).textContent;
        
        // Si la característica es una habilidad, la agregamos a `habilidades`
        if (caracteristica.startsWith('habilidad')) {
            // Mapeo de los nombres de las habilidades para coincidir con las claves en la base de datos
            let habilidad = caracteristica.replace('habilidad-', '');  // Creamos el nombre de la habilidad
            if (habilidad === 'forma-fisica') {
                habilidad = 'formaFisica';  // Aseguramos que coincida con la base de datos
            }
            if (habilidad === 'zero') {
                habilidad = 'habilidadZero';  // Aseguramos que coincida con la base de datos
            }
            datosActualizados.habilidades[habilidad] = valor;  // Asignamos el valor
        } else {
            datosActualizados[caracteristica] = valor;  // Para las demás características
        }
    });

    // Ahora enviamos todos los datos al servidor
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

function pintarCorazones(idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  const tipo = contenedor.dataset.tipo;
  let actual = parseInt(contenedor.dataset.actual) || 0;
  const max = 5;

  contenedor.innerHTML = '';

  for (let i = 1; i <= max; i++) {
    const span = document.createElement('span');
    span.classList.add('corazon');
    if (i <= actual) span.classList.add('activo');
    span.textContent = '♥'; // o '❤' si prefieres

    span.addEventListener('click', () => {
      actual = (i === actual) ? i - 1 : i;
      contenedor.dataset.actual = actual;
      pintarCorazones(idContenedor);
      actualizarCorazonesEnBD(tipo, actual);
    });

    contenedor.appendChild(span);
  }
}

function actualizarCorazonesEnBD(tipo, valor) {
  const fichaId = obtenerFichaId();
  if (!fichaId) return;

  const data = {};
  data[tipo] = String(valor); // ✅ Forzamos string

  fetch(`/actualizar-ficha/${fichaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(resp => {
    console.log('Respuesta del servidor:', resp);  // Te ayudará a ver si realmente tuvo éxito
    if (resp.success) {
      console.log(`${tipo} actualizado a ${valor}`);
    } else {
      console.error(`Error al actualizar ${tipo}:`, resp.message || 'desconocido');
    }
  })
  .catch(console.error);
}


function actualizarPV(nuevoValor) {
  const fichaId = obtenerFichaId();
  if (!fichaId) return;

  fetch(`/actualizar-ficha/${fichaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pv: String(nuevoValor) }) // ✅ Forzamos string
  })
  .then(res => res.json())
  .then(resp => {
    console.log('Respuesta al actualizar PV:', resp);
    if (!resp.success) {
      console.error('Error al actualizar PV:', resp.message || 'desconocido');
    }
  })
  .catch(console.error);
}

function actualizarBarraVida(actual, max) {
    const barra = document.getElementById('barra-vida'); // Ajusta el id según tu HTML
    if (!barra) return;
    const porcentaje = (actual / max) * 100;
    barra.style.width = porcentaje + '%';
}


document.getElementById('vida-sumar').addEventListener('click', () => {
    let pv = parseInt(document.getElementById('vida-actual').textContent);
    const pvMax = parseInt(document.getElementById('vida-maxima').textContent);
    if (pv < pvMax) {
        pv += 1;
        document.getElementById('vida-actual').textContent = pv;  // actualizar texto primero
        actualizarBarraVida(pv, pvMax);
        actualizarPV(pv);
    }
});



document.getElementById('vida-restar').addEventListener('click', () => {
    let pv = parseInt(document.getElementById('vida-actual').textContent);
    const pvMax = parseInt(document.getElementById('vida-maxima').textContent); // <--- Aquí agregas esto
    if (pv > 0) {
        pv -= 1;
        actualizarPV(pv);
        document.getElementById('vida-actual').textContent = pv;
        actualizarBarraVida(pv, pvMax);
    }
});



// Cargar las características y habilidades cuando la página se haya cargado
document.addEventListener('DOMContentLoaded', function() {
    cargarCaracteristicas();
    cargarHabilidades();

    // Asociar eventos de los botones de sumar y restar características
    const caracteristicas = ['carisma', 'economia', 'torpeza', 'belleza', 'social', 
                             'habilidad-inteligencia', 'habilidad-forma-fisica', 'habilidad-zero', 
                             'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate', 
                             'habilidad-percepcion', 'habilidad-subterfugio', 'habilidad-juegoDeManos',
                            'habilidad-Voluntad'];
                             
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

document.addEventListener('DOMContentLoaded', () => {
  pintarCorazones('corazones-crush');
  pintarCorazones('corazones-arista');

  // Ya tenías esto para la barra de vida:
  const vidaMax = parseInt(document.getElementById('vida-maxima').textContent);
  const vidaActual = parseInt(document.getElementById('vida-actual').textContent);
  actualizarBarraVida(vidaActual, vidaMax);
});

