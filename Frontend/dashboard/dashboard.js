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
// ── Load User Info ──
const userData = localStorage.getItem('user');
if (!userData) {
    window.location.href = '/Frontend/login page/login.html';
} else {
    const user = JSON.parse(userData);
    document.querySelector('.sidebar-user-name').textContent = user.name;
    document.querySelector('.sidebar-user-dept').textContent = user.department + ' Department';
    document.querySelector('.page-header h1').textContent = 'Welcome back, ' + user.name.split(' ')[0] + '! 👋';
}

// ── Logout ──
document.querySelector('.nav-item:last-of-type').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/Frontend/login page/login.html';
});