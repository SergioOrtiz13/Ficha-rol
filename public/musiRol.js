//musiRol.js
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

document.addEventListener('DOMContentLoaded', () => {
    const fichaId = document.getElementById('ficha-id').value;
    const musicSearch = document.getElementById('music-search');
    const openMusic = document.getElementById('open-music');
    const musicApp = document.getElementById('music-app');

    const musicUpload = document.getElementById('music-upload');
    const musicLibrary = document.getElementById('music-library');

    const audioPlayer = document.getElementById('audio-player');

    const playPauseBtn = document.getElementById('play-pause');
    const nextBtn = document.getElementById('next-song');
    const prevBtn = document.getElementById('prev-song');

    const progressBar = document.getElementById('music-progress');

    const currentTimeText = document.getElementById('current-time');
    const durationTimeText = document.getElementById('duration-time');

    const currentSongText = document.getElementById('current-song');

    let songs = [];
    let currentSongIndex = 0;

    loadSavedSongs();

    async function loadSavedSongs() {

    try {

        const res = await fetch(`/music/${fichaId}`);

        const data = await res.json();

        songs = data;

        renderSongs();

    } catch(err) {

        console.error(err);

    }

}

    // ABRIR APP MUSICA
    openMusic.addEventListener('click', () => {

        document.getElementById('chat-app').style.display = 'none';
        document.getElementById('contacts-app').style.display = 'none';

        musicApp.style.display = 'flex';

    });

    // SUBIR CANCIONES
musicUpload.addEventListener('change', async (e) => {

    const files = Array.from(e.target.files);

    for (const file of files) {

        const formData = new FormData();

        formData.append('music', file);

        const res = await fetch(
            `/upload-music/${fichaId}`,
            {
                method:'POST',
                body:formData
            }
        );

        const data = await res.json();

        if (data.success) {

            songs.push(data.music);

        }

    }

    renderSongs();

});

    // CARGAR CANCION
    function loadSong(index) {

        const song = songs[index];

        if (!song) return;

        audioPlayer.src = song.url;

        currentSongText.textContent = song.name;

    }

    function renderSongs(filter = '') {

    musicLibrary.innerHTML = '';

    const normalizedFilter = filter.toLowerCase();

    songs.forEach((songData, index) => {

        const normalizedSong =
            songData.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()

        // BUSQUEDA FLEXIBLE
        if (!normalizedSong.includes(normalizedFilter)) {
            return;
        }

        const songDiv = document.createElement('div');

        songDiv.style.background = '#222';
        songDiv.style.padding = '10px';
        songDiv.style.borderRadius = '10px';
        songDiv.style.cursor = 'pointer';

        songDiv.textContent = `🎵 ${songData.name}`;

        songDiv.addEventListener('click', () => {

            currentSongIndex = index;

            loadSong(currentSongIndex);

            audioPlayer.play();

            playPauseBtn.textContent = '⏸️';

        });

        musicLibrary.appendChild(songDiv);

    });

}

musicSearch.addEventListener('input', () => {

    renderSongs(musicSearch.value);

});

    // PLAY / PAUSA
    playPauseBtn.addEventListener('click', () => {

        if (!audioPlayer.src) return;

        if (audioPlayer.paused) {

            audioPlayer.play();

            playPauseBtn.textContent = '⏸️';

        } else {

            audioPlayer.pause();

            playPauseBtn.textContent = '▶️';

        }

    });

    // SIGUIENTE
// ADELANTAR 10 SEGUNDOS
nextBtn.addEventListener('click', () => {

    if (!audioPlayer.duration) return;

    audioPlayer.currentTime += 10;

});

// RETROCEDER 10 SEGUNDOS
prevBtn.addEventListener('click', () => {

    if (!audioPlayer.duration) return;

    audioPlayer.currentTime -= 10;

    if (audioPlayer.currentTime < 0) {
        audioPlayer.currentTime = 0;
    }

});

    // ACTUALIZAR BARRA
    audioPlayer.addEventListener('timeupdate', () => {

        const progress =
            (audioPlayer.currentTime / audioPlayer.duration) * 100;

        progressBar.value = progress || 0;

        currentTimeText.textContent =
            formatTime(audioPlayer.currentTime);

        durationTimeText.textContent =
            formatTime(audioPlayer.duration);

    });

    // MOVER BARRA
    progressBar.addEventListener('input', () => {

        const seekTime =
            (progressBar.value / 100) * audioPlayer.duration;

        audioPlayer.currentTime = seekTime;

    });

    // AUTO NEXT
    audioPlayer.addEventListener('ended', () => {

        nextBtn.click();

    });

    // FORMATO TIEMPO
    function formatTime(time) {

        if (isNaN(time)) return '0:00';

        const minutes = Math.floor(time / 60);

        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, '0');

        return `${minutes}:${seconds}`;

    }

    const backBtn = document.getElementById('phone-back-btn');

backBtn.addEventListener('click', () => {

    musicApp.style.display = 'none';

});

});

