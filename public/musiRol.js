document.addEventListener('DOMContentLoaded', () => {

    const socket = io();
    const audio = document.getElementById('audio-player');
    const musicBtn = document.getElementById('music-control');

    const modal = document.getElementById('music-modal');
    const list = document.getElementById('music-list');

    const token = localStorage.getItem('token');

    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    }

    const decoded = token ? parseJwt(token) : {};
    const isAdmin = decoded.role === 'admin';

    let currentSong = null;

    musicBtn.addEventListener('click', async () => {

        if (!isAdmin) {
            alert('Solo el admin puede controlar la música');
            return;
        }

        // STOP si está sonando
        if (currentSong) {
            socket.emit('stopMusic');
            currentSong = null;
            return;
        }

        // abrir modal
        modal.style.display = 'flex';
        list.innerHTML = 'Cargando...';

        const res = await fetch('/music-list');
        const songs = await res.json();

        list.innerHTML = '';

        songs.forEach(song => {

            const btn = document.createElement('div');
            btn.textContent = song;
            btn.style.padding = '10px';
            btn.style.cursor = 'pointer';
            btn.style.borderBottom = '1px solid #ddd';

            btn.addEventListener('click', () => {

                socket.emit('playMusic', {
                    song,
                    timestamp: Date.now()
                });

                currentSong = song;
                modal.style.display = 'none';
            });

            list.appendChild(btn);
        });
    });

    // cerrar modal al click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    socket.on('playMusic', (data) => {
        audio.src = `/music/${data.song}`;
        audio.currentTime = 0;

        audio.play().catch(() => {});
    });

    socket.on('stopMusic', () => {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        currentSong = null;
    });

});