import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

// Initial Reveal Animations
window.addEventListener('load', () => {
    // Reveal hero elements
    gsap.to('.reveal', {
        opacity: 1,
        y: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: 'expo.out',
        scrollTrigger: {
            trigger: '.reveal',
            start: 'top 85%',
        }
    });

    // Liquid background movement based on cursor
    const blob = document.querySelector('.blob');
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 50;
        const y = (clientY / window.innerHeight - 0.5) * 50;
        
        gsap.to(blob, {
            x: x,
            y: y,
            duration: 2,
            ease: 'power2.out'
        });
    });
});

// Trigger Confetti Celebration (Simulating a "Drop" discovery)
const confettiBtn = document.getElementById('trigger-confetti');
if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
        const colors = ['#a29bfe', '#74b9ff', '#81ecec', '#fab1a0'];
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: colors
        });
    });
}

// Form Handling (Visual feedback)
const form = document.getElementById('waitlist-form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        btn.textContent = '¡Bienvenido!';
        btn.style.background = '#00b894';
        form.reset();
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});
