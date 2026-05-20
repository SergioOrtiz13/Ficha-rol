document.addEventListener("DOMContentLoaded", () => {

    const fichaId = document.getElementById("ficha-id").value;

    const openCallsBtn = document.getElementById("open-calls");
    const callsApp = document.getElementById("calls-app");
    const callsList = document.getElementById("calls-list");

    const openContactsBtn = document.getElementById("open-contacts");
    const contactsApp = document.getElementById("contacts-app");

    const phoneModal = document.getElementById("phone-modal");
    const backBtn = document.getElementById("phone-back-btn");
    const homeBtn = document.getElementById("phone-home-btn");

    console.log("📞 telefono.js cargado");

    // =========================
    // ABRIR LLAMADAS
    // =========================
    openCallsBtn.addEventListener("click", async () => {

        console.log("CLICK llamadas");

        // 🔥 FORZAR VISIBILIDAD Y LAYOUT CORRECTO
        callsApp.style.display = "flex";
        callsApp.style.flexDirection = "column";
        callsApp.style.height = "calc(100% - 60px)";
        callsApp.style.overflow = "hidden";

        contactsApp.style.display = "none";

        await loadCalls();
    });

    // =========================
    // ABRIR CONTACTOS
    // =========================
    if (openContactsBtn) {
        openContactsBtn.addEventListener("click", () => {
            contactsApp.style.display = "flex";
            callsApp.style.display = "none";
        });
    }

    // =========================
    // CARGAR LLAMADAS (CONTACTOS)
    // =========================
    async function loadCalls() {

        callsList.innerHTML = "Cargando...";

        const token = localStorage.getItem("token");

        console.log("📦 fichaId:", fichaId);
        console.log("🔑 token:", token);

        if (!token) {
            callsList.innerHTML = "<p>❌ No hay token</p>";
            return;
        }

        try {
            const res = await fetch(`/contacts/${fichaId}`, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            console.log("📡 status:", res.status);

            if (!res.ok) {
                callsList.innerHTML = "<p>❌ Error cargando contactos</p>";
                return;
            }

            const data = await res.json();

            console.log("📞 contactos:", data);

            callsList.innerHTML = "";

            if (!Array.isArray(data) || data.length === 0) {
                callsList.innerHTML = "<p>No hay contactos guardados</p>";
                return;
            }

            data.forEach(c => {

                const div = document.createElement("div");

                // 🔥 ESTILO VISUAL (DEBUG + UI)
                div.style.display = "flex";
                div.style.justifyContent = "space-between";
                div.style.alignItems = "center";
                div.style.padding = "10px";
                div.style.background = "#222";
                div.style.borderRadius = "10px";
                div.style.color = "white";
                div.style.border = "1px solid #333";

                div.innerHTML = `
                    <span>📞 ${c.name}</span>
                    <button style="
                        padding:5px 10px;
                        border:none;
                        border-radius:6px;
                        cursor:pointer;
                    ">📲 Llamar</button>
                `;

                div.querySelector("button").addEventListener("click", () => {
                    console.log("📲 llamando a:", c.name);
                    alert("📞 Llamando a " + c.name);
                });

                callsList.appendChild(div);
            });

            console.log("📦 hijos en lista:", callsList.children.length);

        } catch (err) {
            console.error("❌ error fetch contactos:", err);
            callsList.innerHTML = "<p>❌ Error de red</p>";
        }
    }
    backBtn.addEventListener("click", () => {

    // ocultar apps internas
    document.getElementById("calls-app").style.display = "none";
    document.getElementById("contacts-app").style.display = "none";
    document.getElementById("chat-app").style.display = "none";
    document.getElementById("music-app").style.display = "none";

    // volver al menú principal del móvil
    document.querySelectorAll(".app-icon").forEach(el => {
        el.style.display = "block";
    });
});
});