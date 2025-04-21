function tirarDadosOtrosJugadores() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }

    document.getElementById('resultado-dados').textContent = 'Resultados de tus dados: ' + resultados.join(', ');

    localStorage.setItem('resultadosTiradaOtrosJugadores', JSON.stringify(resultados));
}

function actualizarResultadoOtrosJugadores(resultados) {
    document.getElementById('tirada-otros-jugadores').textContent = 'Resultado de otros jugadores: ' + resultados.join(', ');
}

document.addEventListener('DOMContentLoaded', function () {
    const resultados = JSON.parse(localStorage.getItem('resultadosTiradaOtrosJugadores'));
    if (resultados) {
        actualizarResultadoOtrosJugadores(resultados);
    }
});

window.addEventListener('storage', function (evento) {
    if (evento.key === 'resultadosTiradaOtrosJugadores') {
        const resultados = JSON.parse(evento.newValue);
        if (resultados) {
            actualizarResultadoOtrosJugadores(resultados);
        }
    }
});