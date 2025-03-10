function actualizarHabilidades() {
    var habilidadesAdquiridas = document.getElementById('habilidades-adquiridas').value;
    localStorage.setItem('habilidadesAdquiridas', habilidadesAdquiridas);
}

function cargarHabilidades() {
    var habilidadesAdquiridas = localStorage.getItem('habilidadesAdquiridas');
    if (habilidadesAdquiridas) {
        document.getElementById('habilidades-adquiridas').value = habilidadesAdquiridas;
    }
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

function tirarDados() {
    var resultados = [];
    for (var i = 0; i < 3; i++) {
        resultados.push(Math.floor(Math.random() * 6) + 1);
    }
    document.getElementById('resultado-dados').textContent = 'Resultados de los dados: ' + resultados.join(', ');
    localStorage.setItem('resultadoDados', JSON.stringify(resultados));
}

function cargarDados() {
    var resultados = localStorage.getItem('resultadoDados');
    if (resultados) {
        document.getElementById('resultado-dados').textContent = 'Resultados de los dados: ' + JSON.parse(resultados).join(', ');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarCaracteristicas();
    cargarHabilidades();
    cargarDados();
    document.getElementById('habilidades-adquiridas').addEventListener('input', actualizarHabilidades);
});