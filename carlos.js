function actualizarHabilidades() {
    var habilidadesAdquiridas = document.getElementById('habilidades-adquiridas-carlos').value;
    localStorage.setItem('habilidadesAdquiridasCarlos', habilidadesAdquiridas);
}

function cargarHabilidades() {
    var habilidadesAdquiridas = localStorage.getItem('habilidadesAdquiridasCarlos');
    if (habilidadesAdquiridas) {
        document.getElementById('habilidades-adquiridas-carlos').value = habilidadesAdquiridas;
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
    var caracteristicas = ['carisma-carlos', 'economia-carlos', 'torpeza-carlos', 'inteligencia-carlos', 'social-carlos', 'habilidad-inteligencia-carlos', 'habilidad-forma-fisica-carlos', 'habilidad-zero-carlos', 'habilidad-sigilo-carlos', 'habilidad-reflejos-carlos', 'habilidad-combate-carlos'];
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
    document.getElementById('habilidades-adquiridas-carlos').addEventListener('input', actualizarHabilidades);
});