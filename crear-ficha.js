document.getElementById('crear-ficha-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nombrePersonaje = document.getElementById('nombre-personaje').value;
    const imagenPersonaje = document.getElementById('imagen-personaje').files[0];
    const videoFondo = document.getElementById('video-fondo').files[0];
    const carisma = document.getElementById('carisma').value;
    const economia = document.getElementById('economia').value;
    const torpeza = document.getElementById('torpeza').value;
    const belleza = document.getElementById('belleza').value;
    const social = document.getElementById('social').value;
    const historia = document.getElementById('historia').value;
    const personalidad = document.getElementById('personalidad').value;
    const habilidadesAdquiridas = document.getElementById('habilidades-adquiridas').value;

    if (!nombrePersonaje || !imagenPersonaje || !videoFondo || !historia || !personalidad) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    const miembrosArbol = Array.from(document.querySelectorAll('[name="miembro-arbol[]"]')).map(input => input.value);

    const habilidadInteligencia = document.getElementById('habilidad-inteligencia').value;
    const habilidadFormaFisica = document.getElementById('habilidad-forma-fisica').value;
    const habilidadZero = document.getElementById('habilidad-zero').value;
    const habilidadSigilo = document.getElementById('habilidad-sigilo').value;
    const habilidadReflejos = document.getElementById('habilidad-reflejos').value;
    const habilidadCombate = document.getElementById('habilidad-combate').value;

    // Crear un FormData para enviar los datos al backend
    const formData = new FormData();

    // Añadir todos los campos de texto
    formData.append('nombrePersonaje', nombrePersonaje);
    formData.append('carisma', carisma);
    formData.append('economia', economia);
    formData.append('torpeza', torpeza);
    formData.append('belleza', belleza);
    formData.append('social', social);
    formData.append('historia', historia);
    formData.append('personalidad', personalidad);
    formData.append('habilidadesAdquiridas', habilidadesAdquiridas);
    formData.append('miembrosArbol', JSON.stringify(miembrosArbol));  // Convertimos el array a JSON

    // Añadir las habilidades
    formData.append('habilidades[inteligencia]', habilidadInteligencia);
    formData.append('habilidades[formaFisica]', habilidadFormaFisica);
    formData.append('habilidades[habilidadZero]', habilidadZero);
    formData.append('habilidades[sigilo]', habilidadSigilo);
    formData.append('habilidades[reflejos]', habilidadReflejos);
    formData.append('habilidades[combate]', habilidadCombate);

    // Añadir los archivos
    formData.append('imagenPersonaje', imagenPersonaje);
    formData.append('videoFondo', videoFondo);

    // Enviar los datos al backend utilizando fetch con FormData
    try {
        const response = await fetch('/crear-ficha', {
            method: 'POST',
            body: formData,  // Aquí enviamos el FormData en lugar del JSON
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Ficha guardada correctamente');
            // Redirigir o realizar alguna otra acción
        } else {
            alert('Error al guardar la ficha: ' + result.message);
        }
    } catch (error) {
        alert('Error al enviar los datos al servidor: ' + error.message);
    }
});