function tirarDados() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1); // Genera un número aleatorio entre 1 y 6
    }
    document.getElementById('resultado-dados').textContent = 'Resultados de los dados: ' + resultados.join(', ');
    localStorage.setItem('resultadoDados', JSON.stringify(resultados)); // Guarda los resultados en localStorage
}

function cargarDados() {
    var resultados = localStorage.getItem('resultadoDados');
    if (resultados) {
        document.getElementById('resultado-dados').textContent = 'Resultados de los dados: ' + JSON.parse(resultados).join(', ');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarDados(); // Carga los resultados cuando la página se haya cargado completamente
    setInterval(cargarDados, 1000); // Verifica cambios en localStorage cada segundo
});