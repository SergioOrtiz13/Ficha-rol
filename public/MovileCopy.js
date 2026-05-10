const personajeName = document.getElementById('personaje-name')?.value;
document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // BASE
    // =========================
    const token = localStorage.getItem('token');
    const fichaId = document.getElementById('ficha-id')?.value;

    // =========================
    // PHONE MODAL
    // =========================
    const phoneIcon = document.getElementById('phone-icon');
    const phoneModal = document.getElementById('phone-modal');
    const closePhone = document.getElementById('close-phone');
    
    phoneIcon?.addEventListener('click', () => {
        phoneModal.style.display = 'flex';
    });

    closePhone?.addEventListener('click', () => {
        phoneModal.style.display = 'none';
    });

    phoneModal?.addEventListener('click', (e) => {
        if (e.target === phoneModal) {
            phoneModal.style.display = 'none';
        }
    });

    // =========================
    // CONTACTS ELEMENTS
    // =========================
    const openContacts = document.getElementById('open-contacts');
    const contactsApp = document.getElementById('contacts-app');
    const closeContacts = document.getElementById('close-contacts');
    const addContactBtn = document.getElementById('add-contact');
    const contactInput = document.getElementById('contact-input');
    const contactsList = document.getElementById('contacts-list');

    // =========================
    // CHAT ELEMENTS
    // =========================
    const chatIcon = document.getElementById('open-chat');
    const chatApp = document.getElementById('chat-app');
    const chatName = document.getElementById('chat-name');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-message');
    const closeChat = document.getElementById('close-chat');
    const chatInputContainer = document.getElementById('chat-input-container');
    let currentChat = null;
    let cachedContacts = []; // 👈 NUEVO: reutilizamos la misma lista

    let chatOpen = false;

    // =========================
    // LOAD CONTACTS
    // =========================
    async function loadContacts() {
        const res = await fetch(`/contacts/${fichaId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await res.json();
        cachedContacts = data; // 👈 guardamos copia global
        return data;
    }

    // =========================
    // OPEN CHAT
    // =========================
async function openChat(contact) {

    const chatTarget = contact.realName || contact.name;

    currentChat = contact;
    chatOpen = true;

    chatName.textContent = contact.name;

    chatMessages.innerHTML = '';

    chatInput.disabled = false;
    sendBtn.disabled = false;

    chatInput.placeholder = `Escribe a ${contact.name}...`;

    chatApp.style.display = 'flex';

    chatInputContainer.style.display = 'flex';

    // cargar historial
    const res = await fetch(
    `/messages/${personajeName}/${chatTarget}`
);

    const messages = await res.json();

    messages.forEach(msg => {

        const div = document.createElement('div');

        const isMine = msg.from === personajeName;

        div.style = `
            align-self:${isMine ? 'flex-end' : 'flex-start'};
            background:${isMine ? '#4caf50' : '#333'};
            padding:8px;
            border-radius:10px;
            max-width:70%;
            margin:5px;
            color:white;
        `;

        div.textContent = msg.text;

        chatMessages.appendChild(div);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

    // =========================
    // RENDER CONTACTS (CONTACTOS APP)
    // =========================
    function renderContacts(list, container) {
        container.innerHTML = '';

        list.forEach(c => {
            const div = document.createElement('div');

            div.style = `
                display:flex;
                align-items:center;
                gap:10px;
                padding:10px;
                background:#1c1c1c;
                border-radius:10px;
                cursor:pointer;
                justify-content:space-between;
            `;

            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    ${
                        c.isCharacter
                            ? `<img src="${c.image}" style="width:40px;height:40px;border-radius:50%;">`
                            : `<div style="width:40px;height:40px;border-radius:50%;background:#555;"></div>`
                    }
                    <span>${c.name}</span>
                </div>

                <button class="delete-contact">✖</button>
            `;

            div.querySelector('.delete-contact')?.addEventListener('click', async (e) => {
                e.stopPropagation();

                await fetch(`/contacts/${fichaId}/delete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ name: c.name })
                });

                loadAndRenderContacts();
            });

            container.appendChild(div);
        });
    }

    async function loadAndRenderContacts() {
        const data = await loadContacts();
        renderContacts(data, contactsList);
    }

    // =========================
    // 🔥 RENDER CONTACTS FOR CHAT (REUTILIZA LOS CONTACTOS)
    // =========================
async function renderContactsForChat() {

    chatMessages.innerHTML = '';

    chatName.textContent = 'Chat';

    // contactos normales
    const contacts = [...cachedContacts];

    // conversaciones desde mongo
    const res = await fetch(`/chat-list/${personajeName}`);

    const mongoChats = await res.json();

    // fusionar
    mongoChats.forEach(chat => {

        const exists = contacts.find(
            c => c.name === chat.name
        );

        if (!exists) {

            contacts.push({
                name: 'DESCONOCIDO',
                realName: chat.name,
                isCharacter: false,
                image: '',
                unknown: true
            });
        }
    });

    const chatList = document.createElement('div');

    chatList.style = `
        display:flex;
        flex-direction:column;
        gap:8px;
    `;

    contacts.forEach(c => {

        const div = document.createElement('div');

        div.style = `
            display:flex;
            align-items:center;
            gap:10px;
            padding:10px;
            background:#1c1c1c;
            border-radius:10px;
            cursor:pointer;
        `;

        div.innerHTML = `
            ${
                c.isCharacter
                    ? `<img src="${c.image}" style="width:40px;height:40px;border-radius:50%;">`
                    : `<div style="width:40px;height:40px;border-radius:50%;background:#555;"></div>`
            }

            <span>${c.name}</span>
        `;

        div.addEventListener('click', () => {



            openChat(c);
        });

        chatList.appendChild(div);
    });

    chatMessages.appendChild(chatList);

    chatInput.disabled = true;
    sendBtn.disabled = true;

    chatInput.placeholder = 'Selecciona un contacto...';

    chatOpen = false;

    currentChat = null;

    chatInputContainer.style.display = 'none';
}

    // =========================
    // SEND MESSAGE
    // =========================
function sendMessage() {

    const text = chatInput.value.trim();

    if (!text || !currentChat || !chatOpen) return;

    const messageData = {
        from: personajeName,
        to: currentChat.realName || currentChat.name,
        text
    };

    socket.emit('sendMessage', messageData);

    chatInput.value = '';
}

socket.on('newMessage', (msg) => {

    if (!currentChat) return;

const targetName =
    currentChat.realName || currentChat.name;

const isCurrentChat =
    (
        msg.from === personajeName &&
        msg.to === targetName
    )
    ||
    (
        msg.from === targetName &&
        msg.to === personajeName
    );

    if (!isCurrentChat) return;

    const div = document.createElement('div');

    const isMine = msg.from === personajeName;

    div.style = `
        align-self:${isMine ? 'flex-end' : 'flex-start'};
        background:${isMine ? '#4caf50' : '#333'};
        padding:8px;
        border-radius:10px;
        max-width:70%;
        margin:5px;
        color:white;
    `;

    div.textContent = msg.text;

    chatMessages.appendChild(div);

    if (!chatOpen) {
    renderContactsForChat();
}

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

    // =========================
    // CONTACTS APP
    // =========================
    openContacts?.addEventListener('click', () => {
        contactsApp.style.display = 'flex';
        loadAndRenderContacts();
    });

    closeContacts?.addEventListener('click', () => {
        contactsApp.style.display = 'none';
    });

    addContactBtn?.addEventListener('click', async () => {
        const name = contactInput.value.trim();
        if (!name) return;

        await fetch(`/contacts/${fichaId}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ name })
        });

        contactInput.value = '';
        loadAndRenderContacts();
    });

    // =========================
    // CHAT APP
    // =========================
    chatIcon?.addEventListener('click', async () => {
        await loadContacts(); // 👈 importante: actualiza cache

        chatMessages.innerHTML = '';
        currentChat = null;

        renderContactsForChat();

        chatApp.style.display = 'flex';
    });

    closeChat?.addEventListener('click', () => {
        chatApp.style.display = 'none';
    });

    sendBtn?.addEventListener('click', sendMessage);

    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

});