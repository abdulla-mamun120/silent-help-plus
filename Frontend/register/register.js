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
function setupToggle(btnId, inputId) {
    document.getElementById(btnId).addEventListener('click', () => {
        const input = document.getElementById(inputId);
        const icon = document.querySelector(`#${btnId} i`);
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
}
setupToggle('toggle-pass', 'password');
setupToggle('toggle-confirm', 'confirm-password');

// Password Strength
document.getElementById('password').addEventListener('input', function () {
    const val = this.value;
    const fill = document.getElementById('strength-fill');
    const text = document.getElementById('strength-text');
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    const levels = [
        { width: '0%', color: '#E0E0E0', label: 'Enter a password' },
        { width: '25%', color: '#F44336', label: 'Weak' },
        { width: '50%', color: '#FF9800', label: 'Fair' },
        { width: '75%', color: '#2196F3', label: 'Good' },
        { width: '100%', color: '#4CAF50', label: 'Strong' },
    ];

    fill.style.width = levels[strength].width;
    fill.style.backgroundColor = levels[strength].color;
    text.textContent = levels[strength].label;
    text.style.color = levels[strength].color;
});

// Form Validation & Submit
document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    const showError = (id, show) => {
        const el = document.getElementById(id);
        el.classList.toggle('show', show);
        const input = el.previousElementSibling?.querySelector('.form-control') ||
                      el.previousElementSibling;
        if (input?.classList) input.classList.toggle('error', show);
    };

    const fullname = document.getElementById('fullname').value.trim();
    const studentId = document.getElementById('student-id').value.trim();
    const dept = document.getElementById('department').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms').checked;

    if (!fullname) { showError('fullname-error', true); valid = false; }
    else showError('fullname-error', false);

    if (!studentId) { showError('studentid-error', true); valid = false; }
    else showError('studentid-error', false);

    if (!dept) { showError('dept-error', true); valid = false; }
    else showError('dept-error', false);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) { showError('email-error', true); valid = false; }
    else showError('email-error', false);

    if (password.length < 8) { showError('pass-error', true); valid = false; }
    else showError('pass-error', false);

    if (password !== confirm) { showError('confirm-error', true); valid = false; }
    else showError('confirm-error', false);

    if (!terms) { showError('terms-error', true); valid = false; }
    else showError('terms-error', false);

    if (valid) {
        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

        const data = {
            name: fullname,
            email: email,
            password: password,
            department: dept,
            student_id: studentId
        };

        fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(result => {
            if (result.message === 'Registration successful!') {
                document.getElementById('form-section').style.display = 'none';
                document.getElementById('success-message').classList.add('show');
            } else {
                alert(result.message);
                btn.disabled = false;
                btn.innerHTML = '<span>Create Account</span><i class="fas fa-user-plus"></i>';
            }
        })
        .catch(err => {
            alert('Something went wrong! Try again.');
            btn.disabled = false;
            btn.innerHTML = '<span>Create Account</span><i class="fas fa-user-plus"></i>';
        });
    }
});