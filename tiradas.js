function tirarDados() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }
    document.getElementById('resultado-dados').textContent = 'Resultados de los dados: ' + resultados.join(', ');
    localStorage.setItem('resultadoDados', JSON.stringify(resultados));
    window.dispatchEvent(new Event('storage'));
}

function cargarDados() {
    var resultados = localStorage.getItem('resultadoDados');
    if (resultados) {
        document.getElementById('resultado-dados').textContent = 'Resultados de los dados: ' + JSON.parse(resultados).join(', ');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarDados();
});

window.addEventListener('storage', function() {
    cargarDados();
});