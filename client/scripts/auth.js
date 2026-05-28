// Authentication Script

// Redirect only from public auth pages
if (['/login', '/register'].includes(window.location.pathname) && getToken()) {
    window.location.href = '/dashboard';
}

function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        document.body.classList.add('dark-mode');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});
