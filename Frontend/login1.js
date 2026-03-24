// Dark Mode
const toggle = document.getElementById('dark-mode-toggle');
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    toggle.textContent = '☀️';
}
toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    toggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark ? 'enabled' : null);
});

// Password Toggle
document.getElementById('toggle-pass').addEventListener('click', () => {
    const input = document.getElementById('login-password');
    const icon = document.querySelector('#toggle-pass i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

// Form Submit
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    const loginId = document.getElementById('login-id').value.trim();
    const password = document.getElementById('login-password').value;

    const idError = document.getElementById('loginid-error');
    const passError = document.getElementById('pass-error');
    const alert = document.getElementById('login-alert');

    if (!loginId) {
        idError.classList.add('show');
        document.getElementById('login-id').classList.add('error');
        valid = false;
    } else {
        idError.classList.remove('show');
        document.getElementById('login-id').classList.remove('error');
    }

    if (!password) {
        passError.classList.add('show');
        document.getElementById('login-password').classList.add('error');
        valid = false;
    } else {
        passError.classList.remove('show');
        document.getElementById('login-password').classList.remove('error');
    }

    if (valid) {
        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        alert.classList.remove('show');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
});