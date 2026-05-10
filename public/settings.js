document.addEventListener('DOMContentLoaded', () => {

    const settingsBtn = document.getElementById('open-settings');
    const phoneModal = document.getElementById('phone-modal');
    const fichaId = document.getElementById('ficha-id')?.value;

    const phoneBody = phoneModal.querySelector('div');

    const settingsPanel = document.createElement('div');

    settingsPanel.id = 'settings-app';

    settingsPanel.style.cssText = `
        display:none;
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:calc(100% - 60px);
        background:#111;
        color:white;
        padding:15px;
        box-sizing:border-box;
        flex-direction:column;
        gap:10px;
        z-index:999;
    `;

    settingsPanel.innerHTML = `
        <h3>⚙️ Ajustes del móvil</h3>

        <label>Color de fondo</label>
        <input type="color" id="bg-color">

        <label style="margin-top:10px;">Imagen de fondo</label>

        <button id="select-image">
            📷 Seleccionar imagen
        </button>

        <input type="file" id="bg-image-file" accept="image/*" style="display:none;">

        <button id="save-settings" style="margin-top:15px;">
            Guardar
        </button>
    `;

    phoneBody.appendChild(settingsPanel);

    const bgColor = settingsPanel.querySelector('#bg-color');
    const fileInput = settingsPanel.querySelector('#bg-image-file');
    const selectBtn = settingsPanel.querySelector('#select-image');
    const saveBtn = settingsPanel.querySelector('#save-settings');

    let selectedFile = null;

    // =========================
    // ABRIR PANEL
    // =========================
    settingsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.style.display = 'flex';
    });

    // =========================
    // SELECT IMAGE
    // =========================
    selectBtn?.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput?.addEventListener('change', (e) => {
        selectedFile = e.target.files[0] || null;
    });

    // =========================
    // GUARDAR SETTINGS
    // =========================
    saveBtn?.addEventListener('click', async () => {

        const formData = new FormData();

        formData.append('phoneBackgroundColor', bgColor.value);

        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        await fetch(`/guardar-phone-settings/${fichaId}`, {
            method: 'PUT',
            body: formData
        });

        applyBackground(bgColor.value, selectedFile
            ? URL.createObjectURL(selectedFile)
            : ''
        );
    });

    // =========================
    // APLICAR FONDO
    // =========================
function applyBackground(color, image) {

    const phone = phoneModal.querySelector('div');

    if (image && image.length > 0) {

        phone.style.background = `url(${image}) center/cover no-repeat`;

    } else {

        phone.style.background = color || "#111";
    }
}

    // =========================
    // CARGAR SETTINGS
    // =========================
async function loadSettings() {

    const res = await fetch(`/phone-settings/${fichaId}`);
    const data = await res.json();

    const phone = phoneModal.querySelector('div');

    if (data.phoneBackgroundMode === "image" && data.phoneBackgroundImage) {

        phone.style.background = `url(${data.phoneBackgroundImage}) center/cover no-repeat`;

    } else if (data.phoneBackgroundColor) {

        phone.style.background = data.phoneBackgroundColor;

    } else {

        phone.style.background = "#111"; // solo fallback visual, NO guardado
    }
}

    loadSettings();
});