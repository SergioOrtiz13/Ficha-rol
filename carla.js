function actualizarHabilidades() {
    var habilidadesAdquiridas = document.getElementById('habilidades-adquiridas').value;
    localStorage.setItem('habilidadesAdquiridasCarla', habilidadesAdquiridas);
}

function cargarHabilidades() {
    var habilidadesAdquiridas = localStorage.getItem('habilidadesAdquiridasCarla');
    if (habilidadesAdquiridas) {
        document.getElementById('habilidades-adquiridas').value = habilidadesAdquiridas;
    }
}

function actualizarCaracteristica(caracteristica, operacion) {
    var elemento = document.getElementById(caracteristica);
    var valor = parseInt(elemento.textContent);
    if (operacion === 'sumar') {
        elemento.textContent = valor + 1;
    } else if (operacion === 'restar' && valor > 0) {
        elemento.textContent = valor - 1;
    }
    localStorage.setItem(caracteristica + 'Carla', elemento.textContent);
}

function cargarCaracteristicas() {
    var caracteristicas = ['carisma', 'economia', 'torpeza', 'inteligencia', 'social', 'habilidad-inteligencia', 'habilidad-forma-fisica', 'habilidad-zero', 'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate'];
    caracteristicas.forEach(function(caracteristica) {
        var valor = localStorage.getItem(caracteristica + 'Carla');
        if (valor) {
            document.getElementById(caracteristica).textContent = valor;
        }
    });
}

function tirarDados() {
    var resultado = Math.floor(Math.random() * 6) + 1; // Genera un número aleatorio entre 1 y 6
    document.getElementById('resultado-dados').textContent = 'Resultado: ' + resultado;
}

document.addEventListener('DOMContentLoaded', function() {
    cargarCaracteristicas();
    cargarHabilidades();
    document.getElementById('habilidades-adquiridas').addEventListener('input', actualizarHabilidades);
});