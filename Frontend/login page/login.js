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
    const alertBox = document.getElementById('login-alert');

    // Validate Email/ID
    if (!loginId) {
        idError.classList.add('show');
        document.getElementById('login-id').classList.add('error');
        valid = false;
    } else {
        idError.classList.remove('show');
        document.getElementById('login-id').classList.remove('error');
    }

    // Validate Password
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
        alertBox.classList.remove('show');

fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginId, password: password })
        })
        .then(res => res.json())
        .then(result => {
            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                window.location.href = '/dashboard';
            } else {
                document.getElementById('alert-text').textContent = result.message;
                alertBox.style.display = 'flex';
                btn.disabled = false;
                btn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
            }
        })
        .catch(err => {
            alert('Something went wrong! Try again.');
            btn.disabled = false;
            btn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
        });
    }
});