function actualizarHabilidades() {
    var habilidadesAdquiridas = document.getElementById('habilidades-adquiridas-elizabeth').value;
    localStorage.setItem('habilidadesAdquiridasElizabeth', habilidadesAdquiridas);
}

function cargarHabilidades() {
    var habilidadesAdquiridas = localStorage.getItem('habilidadesAdquiridasElizabeth');
    if (habilidadesAdquiridas) {
        document.getElementById('habilidades-adquiridas-elizabeth').value = habilidadesAdquiridas;
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
    var caracteristicas = ['carisma-elizabeth', 'economia-elizabeth', 'torpeza-elizabeth', 'inteligencia-elizabeth', 'social-elizabeth', 'habilidad-inteligencia-elizabeth', 'habilidad-forma-fisica-elizabeth', 'habilidad-zero-elizabeth', 'habilidad-sigilo-elizabeth', 'habilidad-reflejos-elizabeth', 'habilidad-combate-elizabeth'];
    caracteristicas.forEach(function(caracteristica) {
        var valor = localStorage.getItem(caracteristica);
        if (valor !== null) {
            document.getElementById(caracteristica).textContent = valor;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarCaracteristicas();
    cargarHabilidades();
    document.getElementById('habilidades-adquiridas-elizabeth').addEventListener('input', actualizarHabilidades);
});