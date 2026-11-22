function switchSection(sectionName, event) {
    if (event) event.preventDefault();

    const sections = {
        'home': document.getElementById('section-home'),
        'cara-kerja': document.getElementById('section-cara-kerja'),
        'tentang-kami': document.getElementById('section-tentang-kami')
    };

    const tabs = {
        'home': document.getElementById('tab-home'),
        'cara-kerja': document.getElementById('tab-cara-kerja'),
        'tentang-kami': document.getElementById('tab-tentang-kami')
    };

    Object.keys(sections).forEach((key) => {
        if (sections[key]) {
            sections[key].classList.toggle('hidden', key !== sectionName);
        }
        if (tabs[key]) {
            tabs[key].classList.toggle('pill-tab-active', key === sectionName);
        }
    });
}

function showErrorAlert(message) {
    const alertEl = document.getElementById('error-alert');
    if (!alertEl) return;
    alertEl.innerText = message;
    alertEl.classList.remove('hidden');
}

function hideErrorAlert() {
    const alertEl = document.getElementById('error-alert');
    if (!alertEl) return;
    alertEl.innerText = '';
    alertEl.classList.add('hidden');
}

function showLoadingState() {
    hideErrorAlert();
    document.getElementById('upload-card').classList.add('hidden');
    document.getElementById('result-card').classList.add('hidden');
    document.getElementById('loading-card').classList.remove('hidden');
    setProgressStep(1, 20, '1. Ekstraksi metadata & frame...');
}

function setProgressStep(activeStep, percent, message) {
    const bar = document.getElementById('progress-bar');
    const stepText = document.getElementById('loading-step');

    if (bar) bar.style.width = `${percent}%`;
    if (stepText && message) stepText.innerText = message;

    for (let i = 1; i <= 3; i++) {
        const pill = document.getElementById(`step-${i}`);
        if (!pill) continue;
        pill.classList.remove('step-active', 'step-done');
        if (i < activeStep) {
            pill.classList.add('step-done');
        } else if (i === activeStep) {
            pill.classList.add('step-active');
        }
    }
}

function renderResultCard(result) {
    document.getElementById('loading-card').classList.add('hidden');
    document.getElementById('result-card').classList.remove('hidden');

    document.getElementById('res-filename').innerText = result.fileName;
    document.getElementById('res-meta').innerText = `Mode: ${result.mode.toUpperCase()} • Diperiksa pukul ${result.time}`;
    document.getElementById('res-score').innerText = `${result.authenticityScore}%`;

    const badge = document.getElementById('res-status-badge');
    badge.innerText = result.statusLabel;
    badge.className = `status-badge ${result.statusClass}`;

    document.getElementById('res-manipulation').innerText = result.manipulationNote;
    document.getElementById('res-conclusion').innerText = result.conclusion;
    document.getElementById('res-first-source').innerText = result.firstOriginalSource;
    document.getElementById('res-platforms').innerText = result.platforms.join(', ');
    document.getElementById('res-pub-date').innerText = result.publishedDate;

    const linksEl = document.getElementById('res-links');
    if (linksEl) {
        linksEl.innerHTML = result.matchingLinks
            .map(url => `<li>• ${url}</li>`)
            .join('');
    }

    const noteEl = document.getElementById('res-storage-note');
    if (noteEl) {
        noteEl.innerText = typeof getLoggedInUser === 'function' && getLoggedInUser()
            ? `Tercatat untuk sesi ${getLoggedInUser()} (Riwayat Lokal).`
            : 'Tersimpan di riwayat lokal peramban (Mode Tamu).';
    }
}

function resetToUpload(event) {
    if (event) event.preventDefault();
    switchSection('home');
    if (typeof clearFile === 'function') {
        clearFile(null);
    }
    hideErrorAlert();
    document.getElementById('result-card').classList.add('hidden');
    document.getElementById('loading-card').classList.add('hidden');
    document.getElementById('upload-card').classList.remove('hidden');
}