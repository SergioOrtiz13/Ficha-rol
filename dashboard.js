function cargarFichasDinamicas() {
    // Obtener el token JWT del localStorage (o de donde lo tengas almacenado)
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No se encontró el token de autenticación');
        return;  // Si no hay token, no hacer la solicitud
    }

    fetch('/getFichas', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,  // Enviar el token en la cabecera Authorization
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener las fichas: ' + response.statusText);
            }
            return response.json();  // Si la respuesta es exitosa, convertirla a JSON
        })
        .then(fichas => {
            if (Array.isArray(fichas)) {  // Verificar que fichas sea un array
                const fichasGrid = document.querySelector('.fichas-grid');
                
                // Itera sobre las fichas obtenidas y agrega los enlaces dinámicamente
                fichas.forEach(ficha => {
                    // Verifica si ya existe un enlace para la ficha
                    if (!document.querySelector(`a[href="ficha-${ficha.nombrePersonaje}.html"]`)) {
                        // Crear el nuevo enlace para la ficha
                        const enlaceFicha = document.createElement('a');
                        enlaceFicha.href = `/ficha/${ficha.nombrePersonaje}`;  // URL correcta para la ficha
                        enlaceFicha.textContent = `Ficha de ${ficha.nombrePersonaje}`;

                        // Añadir el enlace al contenedor de fichas
                        fichasGrid.appendChild(enlaceFicha);
                    }
                });
            } else {
                console.error('La respuesta no es un array:', fichas);
            }
        })
        .catch(error => console.error('Error al cargar las fichas dinámicas:', error));
}

// Llama a la función cuando se carga la página
window.onload = function() {
    cargarFichasDinamicas();
};



function mostrarFicha(personaje) {
    fetch('ficha.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const ficha = doc.getElementById(`ficha-${personaje}`);
            document.getElementById('ficha-container').innerHTML = ficha.outerHTML;
            inicializarFicha();
        })
        .catch(error => console.error('Error al cargar la ficha:', error));
}

function inicializarFicha() {
    // Cargar el script de ficha.js
    var script = document.createElement('script');
    script.src = 'ficha.js';
    document.body.appendChild(script);
}

