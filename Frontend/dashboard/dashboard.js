// ── Dark Mode ──
const dmToggle = document.getElementById('dark-mode-toggle');

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    dmToggle.textContent = '☀️';
}

dmToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    dmToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark ? 'enabled' : null);
});

// ── Sidebar Toggle ──
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');

sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
});