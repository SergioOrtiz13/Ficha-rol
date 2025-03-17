// Función para tirar los dados y actualizar el resultado del jugador actual
function tirarDadosJugador() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }

    // Actualizar el resultado para el jugador actual
    document.getElementById('resultado-dados').textContent = 'Resultados de tus dados: ' + resultados.join(', ');

    // Guardar los resultados en localStorage para sincronización con otras pestañas
    localStorage.setItem('resultadosTiradaJugador', JSON.stringify(resultados));
}

// Función para tirar los dados y actualizar el resultado de los otros jugadores
function tirarDadosOtrosJugadores() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }

    // Actualizar el resultado para los otros jugadores
    document.getElementById('tirada-otros-jugadores').textContent = 'Resultado de otros jugadores: ' + resultados.join(', ');

    // Guardar los resultados en localStorage para sincronización con otras pestañas
    localStorage.setItem('resultadosTiradaOtrosJugadores', JSON.stringify(resultados));
}

// Función para actualizar la sección de "Resultado de otros jugadores"
function actualizarResultadoOtrosJugadores(resultados) {
    document.getElementById('tirada-otros-jugadores').textContent = 'Resultado de otros jugadores: ' + resultados.join(', ');
}

// Función para actualizar la sección de "Tus Dados"
function actualizarResultadoJugador(resultados) {
    document.getElementById('resultado-dados').textContent = 'Resultados de tus dados: ' + resultados.join(', ');
}

// Al cargar la página, verificamos si ya hay resultados en localStorage
document.addEventListener('DOMContentLoaded', function () {
    const resultadosJugador = JSON.parse(localStorage.getItem('resultadosTiradaJugador'));
    const resultadosOtros = JSON.parse(localStorage.getItem('resultadosTiradaOtrosJugadores'));

    if (resultadosJugador) {
        actualizarResultadoJugador(resultadosJugador);
    }

    if (resultadosOtros) {
        actualizarResultadoOtrosJugadores(resultadosOtros);
    }
});

// Escuchar cambios en localStorage para actualizar los resultados en otras pestañas
window.addEventListener('storage', function (evento) {
    if (evento.key === 'resultadosTiradaJugador') {
        const resultados = JSON.parse(evento.newValue);
        if (resultados) {
            actualizarResultadoJugador(resultados);
        }
    }
    if (evento.key === 'resultadosTiradaOtrosJugadores') {
        const resultados = JSON.parse(evento.newValue);
        if (resultados) {
            actualizarResultadoOtrosJugadores(resultados);
        }
    }
});
