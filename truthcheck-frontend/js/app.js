let currentMode = 'foto';
let selectedItem = null;

const FILE_RULES = {
    foto: {
        acceptMime: ['image/png', 'image/jpeg', 'image/webp'],
        acceptExt: ['png', 'jpg', 'jpeg', 'webp'],
        maxSize: 15 * 1024 * 1024,
        hint: 'Mendukung JPG, PNG, WEBP (Maksimal 15 MB)'
    },
    video: {
        acceptMime: ['video/mp4', 'video/quicktime', 'video/webm'],
        acceptExt: ['mp4', 'mov', 'webm'],
        maxSize: 50 * 1024 * 1024,
        hint: 'Mendukung MP4, MOV, WEBM (Maksimal 50 MB)'
    }
};

const PRESET_SAMPLES = {
    ai: {
        fileName: 'sampel_potret_midjourney_v6.png',
        mode: 'foto',
        sizeLabel: '2.4 MB • Preset Uji Cepat',
        profile: {
            statusLabel: 'AI-Generated',
            statusClass: 'status-ai',
            authenticityScore: 14,
            manipulationNote: 'Tekstur kulit dan pencahayaan latar menunjukkan pola difusi generatif AI tanpa metadata EXIF kamera.',
            firstOriginalSource: 'Galeri Karya Digital AI (Sampel Preset)',
            platforms: ['X / Twitter', 'Instagram'],
            publishedDate: '02 November 2026',
            matchingLinks: [
                'https://example-ai-showcase.io/post/visual-sintetis-01'
            ],
            conclusion: 'Media terindikasi kuat merupakan gambar hasil generasi kecerdasan buatan (AI), bukan dokumentasi kamera nyata.'
        }
    },
    deepfake: {
        fileName: 'sampel_pidato_deepfake_720p.mp4',
        mode: 'video',
        sizeLabel: '12.8 MB • Preset Uji Cepat',
        profile: {
            statusLabel: 'Manipulated',
            statusClass: 'status-manipulated',
            authenticityScore: 21,
            manipulationNote: 'Ditemukan inkonsistensi sinkronisasi bibir dan artefak batas wajah antar-frame pada detik ke-04 hingga 11.',
            firstOriginalSource: 'Kanal Video Asli Sebelum Penyuntingan (Sampel Preset)',
            platforms: ['TikTok', 'YouTube', 'X / Twitter'],
            publishedDate: '18 Oktober 2026',
            matchingLinks: [
                'https://example-video-archive.org/watch?v=original-speech-2026'
            ],
            conclusion: 'Video terindikasi mengalami rekayasa wajah/suara (deepfake) yang berbeda dari rekaman pidato aslinya.'
        }
    },
    manipulated: {
        fileName: 'sampel_poster_berita_editan.jpg',
        mode: 'foto',
        sizeLabel: '1.9 MB • Preset Uji Cepat',
        profile: {
            statusLabel: 'Suspicious',
            statusClass: 'status-suspicious',
            authenticityScore: 44,
            manipulationNote: 'Terdeteksi perbedaan kompresi ELA pada area teks judul dan elemen tempelan digital.',
            firstOriginalSource: 'Portal Berita Nasional (Sampel Preset)',
            platforms: ['WhatsApp Forward', 'Facebook', 'X / Twitter'],
            publishedDate: '29 Oktober 2026',
            matchingLinks: [
                'https://example-news.id/artikel/rilis-resmi-sebelum-suntingan'
            ],
            conclusion: 'Terdapat indikasi suntingan pada bagian teks/visual sehingga konteks gambar berubah dari publikasi awal.'
        }
    },
    authentic: {
        fileName: 'sampel_dokumentasi_kamera_asli.jpg',
        mode: 'foto',
        sizeLabel: '4.1 MB • Preset Uji Cepat',
        profile: {
            statusLabel: 'Authentic',
            statusClass: 'status-authentic',
            authenticityScore: 93,
            manipulationNote: 'Struktur piksel konsisten dan tidak ditemukan artefak manipulasi digital maupun pola generatif AI.',
            firstOriginalSource: 'Arsip Foto Jurnalistik Resmi (Sampel Preset)',
            platforms: ['Portal Berita Resmi', 'X / Twitter'],
            publishedDate: '19 November 2026',
            matchingLinks: [
                'https://example-media-resmi.id/galeri/dokumentasi-asli'
            ],
            conclusion: 'Media konsisten dengan dokumentasi asli dan sesuai dengan sumber publikasi paling awal yang ditemukan.'
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initGuestAuth === 'function') {
        initGuestAuth();
    }

    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleStartAnalysis);
    }
});

// Ganti Mode Foto vs Video
function switchMode(mode, keepSelection = false) {
    currentMode = mode;
    const btnFoto = document.getElementById('btn-mode-foto');
    const btnVideo = document.getElementById('btn-mode-video');
    const fileInput = document.getElementById('file-input');
    const fileHint = document.getElementById('file-hint');

    if (mode === 'foto') {
        btnFoto.classList.add('mode-pill-active');
        btnVideo.classList.remove('mode-pill-active');
        fileInput.accept = "image/png, image/jpeg, image/webp";
        fileHint.innerText = FILE_RULES.foto.hint;
    } else {
        btnVideo.classList.add('mode-pill-active');
        btnFoto.classList.remove('mode-pill-active');
        fileInput.accept = "video/mp4, video/quicktime, video/webm";
        fileHint.innerText = FILE_RULES.video.hint;
    }

    hideErrorAlert();
    if (!keepSelection) {
        clearFile(null);
    }
}

// Drag & Drop Handling
function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('dropzone').classList.add('drag-active');
}

function handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('dropzone').classList.remove('drag-active');
}

function handleDrop(e) {
    e.preventDefault();
    handleDragLeave(e);
    if (e.dataTransfer.files.length) {
        validateAndSelectFile(e.dataTransfer.files[0]);
    }
}

function handleFileSelect(e) {
    if (e.target.files.length) {
        validateAndSelectFile(e.target.files[0]);
    }
}

function validateAndSelectFile(file) {
    hideErrorAlert();
    const rule = FILE_RULES[currentMode];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!rule.acceptMime.includes(file.type) && !rule.acceptExt.includes(ext)) {
        clearFile(null);
        showErrorAlert(`Format berkas tidak sesuai untuk mode ${currentMode}. ${rule.hint}.`);
        return;
    }

    if (file.size > rule.maxSize) {
        const maxMB = rule.maxSize / (1024 * 1024);
        clearFile(null);
        showErrorAlert(`Ukuran berkas melebihi batas maksimal ${maxMB} MB.`);
        return;
    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    selectedItem = {
        type: 'file',
        fileName: file.name,
        mode: currentMode
    };
    updateFileUI(`${file.name} (${sizeMB} MB)`);
}

function selectPresetSample(presetKey) {
    const preset = PRESET_SAMPLES[presetKey];
    if (!preset) return;

    switchMode(preset.mode, true);
    selectedItem = {
        type: 'preset',
        fileName: preset.fileName,
        mode: preset.mode,
        profile: preset.profile
    };
    updateFileUI(`${preset.fileName} (${preset.sizeLabel})`);
}

function updateFileUI(labelText) {
    document.getElementById('filename').innerText = labelText;
    document.getElementById('file-info').classList.remove('hidden');

    const btn = document.getElementById('btn-submit');
    btn.disabled = false;
    btn.className = "w-full mt-5 py-3 px-6 rounded-xl font-semibold text-sm transition bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer";
}

function clearFile(e) {
    if (e) e.stopPropagation();
    selectedItem = null;
    document.getElementById('file-input').value = "";
    document.getElementById('file-info').classList.add('hidden');

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.className = "w-full mt-5 py-3 px-6 rounded-xl font-semibold text-sm transition bg-slate-800 text-slate-500 cursor-not-allowed";
}

function buildAnalysisResult(item) {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (item.type === 'preset' && item.profile) {
        return {
            fileName: item.fileName,
            mode: item.mode,
            time: timeNow,
            ...item.profile
        };
    }

    const keys = Object.keys(PRESET_SAMPLES);
    const pickedKey = keys[item.fileName.length % keys.length];
    const fallbackProfile = PRESET_SAMPLES[pickedKey].profile;

    return {
        fileName: item.fileName,
        mode: item.mode,
        time: timeNow,
        ...fallbackProfile
    };
}

function handleStartAnalysis() {
    if (!selectedItem) return;

    if (typeof consumeGuestQuota === 'function' && !consumeGuestQuota()) {
        showErrorAlert('Kuota pemeriksaan Mode Tamu telah habis. Silakan Masuk / Daftar untuk melanjutkan.');
        if (typeof toggleLoginModal === 'function') {
            toggleLoginModal();
        }
        return;
    }

    const currentItem = { ...selectedItem };
    showLoadingState();

    setTimeout(() => {
        setProgressStep(2, 58, '2. Deteksi manipulasi/AI...');
    }, 800);

    setTimeout(() => {
        setProgressStep(3, 90, '3. Penelusuran sumber & jejak media...');
    }, 1600);

    setTimeout(() => {
        const resultData = buildAnalysisResult(currentItem);
        renderResultCard(resultData);
        if (typeof saveAnalysisToHistory === 'function') {
            saveAnalysisToHistory(resultData);
        }
    }, 2400);
}