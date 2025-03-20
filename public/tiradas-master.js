function tirarDadosOtrosJugadores() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }

    // Mostrar el resultado localmente (solo para el jugador actual)
    document.getElementById('resultado-dados').textContent = 'Resultados de tus dados: ' + resultados.join(', ');

    // Guardar los resultados en localStorage (esto se sincronizará con otras pestañas)
    localStorage.setItem('resultadosTiradaOtrosJugadores', JSON.stringify(resultados));
}

// Función para actualizar la sección de "Resultado de otros jugadores"
function actualizarResultadoOtrosJugadores(resultados) {
    document.getElementById('tirada-otros-jugadores').textContent = 'Resultado de otros jugadores: ' + resultados.join(', ');
}

// Al cargar la página, verificamos si ya hay resultados en localStorage
document.addEventListener('DOMContentLoaded', function () {
    const resultados = JSON.parse(localStorage.getItem('resultadosTiradaOtrosJugadores'));
    if (resultados) {
        actualizarResultadoOtrosJugadores(resultados);
    }
});

// Escuchar cambios en localStorage para actualizar los resultados en otras pestañas
window.addEventListener('storage', function (evento) {
    if (evento.key === 'resultadosTiradaOtrosJugadores') {
        const resultados = JSON.parse(evento.newValue);
        if (resultados) {
            actualizarResultadoOtrosJugadores(resultados);
        }
    }
});