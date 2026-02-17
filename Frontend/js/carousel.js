const track = document.getElementById('testimonials-track');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dotsContainer = document.getElementById('carousel-dots');
const cards = document.querySelectorAll('.testimonial-card');
let currentIndex = 0;
const totalCards = cards.length;

function getCardWidth() { return cards[0].offsetWidth + 20; }

cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
}

function goToSlide(index) { currentIndex = index; updateCarousel(); }

prevBtn.addEventListener('click', () => { currentIndex = (currentIndex - 1 + totalCards) % totalCards; updateCarousel(); });
nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % totalCards; updateCarousel(); });

let autoRotate = setInterval(() => { currentIndex = (currentIndex + 1) % totalCards; updateCarousel(); }, 5000);
track.addEventListener('mouseenter', () => clearInterval(autoRotate));
track.addEventListener('mouseleave', () => {
    autoRotate = setInterval(() => { currentIndex = (currentIndex + 1) % totalCards; updateCarousel(); }, 5000);
});