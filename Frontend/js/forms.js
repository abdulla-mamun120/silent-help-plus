const scrollToTop = document.getElementById('scroll-to-top');
window.addEventListener('scroll', () => scrollToTop.classList.toggle('show', window.scrollY > 300));
scrollToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

const messageInput = document.getElementById('message');
const charCount = document.getElementById('char-count');
if (messageInput && charCount) {
    messageInput.addEventListener('input', function() { charCount.textContent = this.value.length; });
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('✅ Message sent! (Backend pending)');
        this.reset();
        if (charCount) charCount.textContent = '0';
    });
}

const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) newsletterForm.addEventListener('submit', function(e) { e.preventDefault(); alert('✅ Subscribed!'); this.reset(); });

const registerForm = document.getElementById('register-form');
if (registerForm) registerForm.addEventListener('submit', function(e) { e.preventDefault(); alert('✅ Registered! Check email.'); this.reset(); });

const loginForm = document.getElementById('login-form');
if (loginForm) loginForm.addEventListener('submit', function(e) { e.preventDefault(); alert('✅ Login successful!'); this.reset(); });