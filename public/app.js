// app.js - Barcha sahifalar uchun umumiy yordamchi funksiyalar

// ── Autentifikatsiya ──────────────────────────────────────────

async function requireAuth() {
    try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) { window.location.href = '/index.html'; return null; }
        const data = await res.json();
        if (!data.user) { window.location.href = '/index.html'; return null; }
        return data.user;
    } catch {
        window.location.href = '/index.html';
        return null;
    }
}

function setSidebarUser(user) {
    const nameEl   = document.getElementById('user-name');
    const roleEl   = document.getElementById('user-role');
    const avatarEl = document.getElementById('user-avatar');

    if (nameEl)   nameEl.textContent   = user.full_name || user.username;
    if (roleEl)   roleEl.textContent   = user.role === 'admin' ? 'Admin' : 'Klinisist';
    if (avatarEl) avatarEl.textContent = (user.full_name || user.username)[0].toUpperCase();

    if (user.role !== 'admin') {
        document.querySelectorAll('[data-admin-only]').forEach(el => el.remove());
    }
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/index.html';
}

// ── Toast xabarnomalar ────────────────────────────────────────

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ── Modal yordamchilari ───────────────────────────────────────

function openModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('open');
}

function closeModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('open');
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
    }
});

// ── API so'rov yordamchisi ────────────────────────────────────

async function apiFetch(url, options = {}) {
    const defaults = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };
    const merged = { ...defaults, ...options };
    if (merged.body && typeof merged.body === 'object') {
        merged.body = JSON.stringify(merged.body);
    }
    const res = await fetch(url, merged);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `So'rov muvaffaqiyatsiz (${res.status})`);
    return data;
}

// ── Jadval yordamchilari ──────────────────────────────────────

function showEmptyState(tbodyId, message = 'Yozuvlar topilmadi') {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const cols = tbody.closest('table')?.querySelectorAll('th').length || 5;
    tbody.innerHTML = `
        <tr>
            <td colspan="${cols}">
                <div class="empty-state">
                    <div class="empty-icon">&#128196;</div>
                    <h3>${message}</h3>
                    <p>Qidiruvni o'zgartiring yoki yangi yozuv qo'shing.</p>
                </div>
            </td>
        </tr>`;
}

function showTableSpinner(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const cols = tbody.closest('table')?.querySelectorAll('th').length || 5;
    tbody.innerHTML = `<tr><td colspan="${cols}"><div class="spinner"></div></td></tr>`;
}

// ── Sana formatlash ───────────────────────────────────────────

const OYLAR = [
    'Yanvar','Fevral','Mart','Aprel','May','Iyun',
    'Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'
];

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const kun  = String(d.getUTCDate()).padStart(2, '0');
    const oy   = OYLAR[d.getUTCMonth()];
    const yil  = d.getUTCFullYear();
    return `${kun} ${oy} ${yil}`;
}

function calcAge(dobStr) {
    if (!dobStr) return '—';
    const dob = new Date(dobStr);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// ── Faol navigatsiya linki ────────────────────────────────────

// Sub-sahifalarni asosiy bo'limga bog'lash
const PAGE_MAP = {
    'patient-profile.html': 'patients.html'
};

function setActiveNav() {
    const current = window.location.pathname.split('/').pop();
    const mapped  = PAGE_MAP[current] || current;

    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href') || '';
        if (href === mapped || href === current) {
            link.classList.add('active');
        }
    });
}

// ── O'chirish tasdiqlash ──────────────────────────────────────

function confirmDelete(name) {
    return window.confirm(`"${name}" ni o'chirishni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.`);
}
