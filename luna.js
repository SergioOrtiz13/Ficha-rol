function actualizarHabilidades() {
    var habilidadesAdquiridas = document.getElementById('habilidades-adquiridas-luna').value;
    localStorage.setItem('habilidadesAdquiridasLuna', habilidadesAdquiridas);
}

function cargarHabilidades() {
    var habilidadesAdquiridas = localStorage.getItem('habilidadesAdquiridasLuna');
    if (habilidadesAdquiridas) {
        document.getElementById('habilidades-adquiridas-luna').value = habilidadesAdquiridas;
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
    var caracteristicas = ['carisma-luna', 'economia-luna', 'torpeza-luna', 'inteligencia-luna', 'social-luna', 'habilidad-inteligencia-luna', 'habilidad-forma-fisica-luna', 'habilidad-zero-luna', 'habilidad-sigilo-luna', 'habilidad-reflejos-luna', 'habilidad-combate-luna'];
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
    document.getElementById('habilidades-adquiridas-luna').addEventListener('input', actualizarHabilidades);
});