const MAX_GUEST_QUOTA = 3;
const AUTH_KEYS = {
    QUOTA: 'truthcheck_guest_quota',
    HISTORY: 'truthcheck_local_history',
    USER: 'truthcheck_logged_user'
};

function initGuestAuth() {
    if (localStorage.getItem(AUTH_KEYS.QUOTA) === null) {
        localStorage.setItem(AUTH_KEYS.QUOTA, MAX_GUEST_QUOTA.toString());
    }
    updateAuthUI();
    renderHistoryList();
}

function getLoggedInUser() {
    return localStorage.getItem(AUTH_KEYS.USER);
}

function getGuestQuota() {
    return parseInt(localStorage.getItem(AUTH_KEYS.QUOTA) || '0', 10);
}

function consumeGuestQuota() {
    if (getLoggedInUser()) return true;
    const quota = getGuestQuota();
    if (quota <= 0) return false;
    localStorage.setItem(AUTH_KEYS.QUOTA, (quota - 1).toString());
    updateAuthUI();
    return true;
}

function toggleLoginModal() {
    document.getElementById('login-modal').classList.toggle('hidden');
}

function loginWithGoogle() {
    setLoggedInUser('Pengguna Google');
}

function handleEmailLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('login-email');
    const email = emailInput ? emailInput.value.trim() : '';
    if (email) {
        setLoggedInUser(email);
    }
}

function setLoggedInUser(userName) {
    localStorage.setItem(AUTH_KEYS.USER, userName);
    const modal = document.getElementById('login-modal');
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
    }
    updateAuthUI();
}

function logoutUser() {
    localStorage.removeItem(AUTH_KEYS.USER);
    updateAuthUI();
}

function updateAuthUI() {
    const user = getLoggedInUser();
    const badge = document.getElementById('guest-badge');
    const authBtn = document.getElementById('btn-auth-toggle');
    const historyDesc = document.getElementById('history-mode-desc');

    if (!badge || !authBtn) return;

    if (user) {
        badge.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-white font-medium truncate max-w-[140px]">${user}</span>
        `;
        authBtn.innerHTML = '<span>Keluar</span>';
        authBtn.onclick = logoutUser;
        authBtn.className = "bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-1.5 rounded-full text-xs sm:text-sm transition";
        if (historyDesc) {
            historyDesc.innerText = `Masuk sebagai ${user} • Riwayat tersimpan di peramban (localStorage).`;
        }
    } else {
        const quota = getGuestQuota();
        badge.innerHTML = `
            <span class="text-amber-400">⚡</span>
            <span>Tamu (Sisa: <strong id="quota-count" class="text-emerald-400 font-semibold">${quota}/${MAX_GUEST_QUOTA}</strong>)</span>
        `;
        authBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>Masuk / Daftar</span>
        `;
        authBtn.onclick = toggleLoginModal;
        authBtn.className = "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-1.5 rounded-full text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5";
        if (historyDesc) {
            historyDesc.innerText = 'Tersimpan sementara di localStorage peramban. Klik item untuk melihat kembali hasil.';
        }
    }
}

function saveAnalysisToHistory(resultItem) {
    const list = JSON.parse(localStorage.getItem(AUTH_KEYS.HISTORY) || '[]');
    list.unshift(resultItem);
    localStorage.setItem(AUTH_KEYS.HISTORY, JSON.stringify(list.slice(0, 10)));
    renderHistoryList();
}

function clearLocalHistory() {
    localStorage.removeItem(AUTH_KEYS.HISTORY);
    renderHistoryList();
}

function reopenHistoryItem(index) {
    const list = JSON.parse(localStorage.getItem(AUTH_KEYS.HISTORY) || '[]');
    const item = list[index];
    if (!item || typeof renderResultCard !== 'function') return;

    if (typeof switchSection === 'function') {
        switchSection('home');
    }
    document.getElementById('upload-card').classList.add('hidden');
    document.getElementById('loading-card').classList.add('hidden');
    renderResultCard(item);
}

function renderHistoryList() {
    const listEl = document.getElementById('history-list');
    if (!listEl) return;

    const list = JSON.parse(localStorage.getItem(AUTH_KEYS.HISTORY) || '[]');
    if (list.length === 0) {
        listEl.innerHTML = '<li class="italic text-slate-500">Belum ada riwayat pemeriksaan.</li>';
        return;
    }

    listEl.innerHTML = list.map((item, idx) => `
        <li>
            <button type="button" onclick="reopenHistoryItem(${idx})" class="w-full flex items-center justify-between bg-[#070c17] hover:bg-slate-800/70 border border-slate-800 px-3.5 py-2.5 rounded-lg gap-3 text-left transition">
                <div class="truncate">
                    <span class="text-slate-200 font-medium">${item.fileName}</span>
                    <span class="text-slate-500 ml-2">[${item.mode.toUpperCase()}]</span>
                </div>
                <div class="flex items-center space-x-2 shrink-0">
                    <span class="text-emerald-400 font-semibold">${item.statusLabel}</span>
                    <span class="text-slate-500">${item.time}</span>
                </div>
            </button>
        </li>
    `).join('');
}