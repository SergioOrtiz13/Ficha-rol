//dashboard.js
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

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Token inválido:', e);
        return null;
    }
}

function verificarRolYMostrarEnlaces() {
    const token = localStorage.getItem('token');

    if (token) {
        const decodedToken = parseJwt(token);

        if (decodedToken && decodedToken.role === 'admin') {
            document.getElementById('admin-links').style.display = 'block';
        } else {
            document.getElementById('admin-links').style.display = 'none';
        }
    }
}


// Llama a la función cuando se carga la página
window.onload = function() {
    cargarFichasDinamicas();  // Cargar las fichas dinámicas
    verificarRolYMostrarEnlaces();  // Verificar el rol y mostrar los enlaces correspondientes
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

function tirarDado(dado) {
    const resultado = Math.floor(Math.random() * 6) + 1;
    dado.src = `img/dices/dado${resultado}.png`;

    // Opcional: animación simple
    dado.classList.add('girando');
    setTimeout(() => dado.classList.remove('girando'), 500);
}

document.querySelector('.dados').addEventListener('click', () => {
    const dados = document.querySelectorAll('.dado');
    dados.forEach(dado => tirarDado(dado));
});
document.addEventListener('DOMContentLoaded', () => {
    const boton = document.querySelector('.fichas-grid-opciones button');
    if (boton) {
      boton.classList.add('boton-enlace');
    }
  });
  