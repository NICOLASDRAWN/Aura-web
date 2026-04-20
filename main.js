import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';
import SplitType from 'split-type';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

// --- 1. LENIS SMOOTH SCROLL ---
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

// --- 2. ELITE CURSOR ---
const cursor = document.getElementById('custom-cursor');
if (cursor) {
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    document.addEventListener('mousedown', () => cursor.classList.add('active'));
    document.addEventListener('mouseup', () => cursor.classList.remove('active'));

    const interactiveElements = document.querySelectorAll('a, button, .magnetic, .bento-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// --- 3. MAGNETIC & HUD ENGINE ---
const magneticElements = document.querySelectorAll('.magnetic');
magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = el.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const strength = el.dataset.strength || 20;

        const deltaX = (e.clientX - centerX) * (strength / 100);
        const deltaY = (e.clientY - centerY) * (strength / 100);

        gsap.to(el, {
            x: deltaX,
            y: deltaY,
            duration: 0.6,
            ease: "power2.out"
        });
    });

    el.addEventListener('mouseleave', () => {
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.3)"
        });
    });
});

// HUD Fade on scroll
const hud = document.querySelector('.aura-hud');
if (hud) {
    window.addEventListener('scroll', () => {
        const opacity = Math.max(0, 1 - window.scrollY / 500);
        hud.style.opacity = opacity * 0.6;
    });
}

// Randomize HUD data
const hudItems = document.querySelectorAll('.hud-item');
setInterval(() => {
    if (hudItems[0]) hudItems[0].textContent = `LAT: ${(4.6 + Math.random() * 0.01).toFixed(4)}° N`;
    if (hudItems[1]) hudItems[1].textContent = `LON: ${(74.08 + Math.random() * 0.01).toFixed(4)}° W`;
}, 2000);

// --- 4. BENTO & SHOWCASE REVEALS (V6) ---
const reveals = [
    { target: '.hero-content', trigger: '.hero' },
    { target: '.concept-content', trigger: '.concept' },
    { target: '.bento-item', trigger: '.features', stagger: 0.1 },
    { target: '.showcase-container', trigger: '.product-showcase' },
    { target: '.b2b-content', trigger: '.b2b' },
    { target: '.beta', trigger: '.beta' }
];

reveals.forEach(rev => {
    gsap.to(rev.target, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: rev.stagger || 0,
        ease: "expo.out",
        scrollTrigger: {
            trigger: rev.trigger,
            start: "top 80%",
        }
    });
});

// Phone Mockup Parallax
const phone = document.querySelector('.phone-mockup');
if (phone) {
    gsap.to(phone, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
            trigger: ".product-showcase",
            scrub: true
        }
    });
}

// Kinetic Typography
const kineticTexts = new SplitType('.kinetic-text', { types: 'chars' });
gsap.from(kineticTexts.chars, {
    y: 100,
    rotateZ: 5,
    opacity: 0,
    stagger: 0.02,
    duration: 1,
    ease: "expo.out",
    scrollTrigger: {
        trigger: '.hero',
        start: "top 80%",
    }
});

// --- 5. CINEMATIC THREE.JS ENGINE ---
const canvas = document.getElementById('liquid-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const material = new THREE.ShaderMaterial({
    uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iMouse: { value: new THREE.Vector2(0, 0) },
        iScroll: { value: 0 },
        iPulse: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        uniform float iScroll;
        uniform float iPulse;
        varying vec2 vUv;

        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m; m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x * x0.x  + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        float random (vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec2 uv = vUv;
            vec2 mouse = iMouse / iResolution;
            float offset = 0.002 * (1.0 + iScroll * 2.0 + iPulse * 8.0);
            
            float r = snoise(uv * 2.5 + iTime * 0.1);
            float g = snoise(uv * 2.5 + iTime * 0.1 + offset);
            float b = snoise(uv * 2.5 + iTime * 0.1 - offset);
            
            vec3 col1 = vec3(0.98, 0.98, 0.97); 
            vec3 col2 = vec3(0.42, 0.36, 0.95); 
            vec3 col3 = vec3(0.35, 0.72, 0.99); 
            
            vec3 finalCol = mix(col1, col2, smoothstep(0.1, 0.6, r));
            finalCol = mix(finalCol, col3, smoothstep(0.4, 0.9, g));
            
            // Grain
            finalCol += (random(uv + iTime) - 0.5) * 0.06;
            
            gl_FragColor = vec4(finalCol, 1.0);
        }
    `,
    transparent: true
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(mesh);

function animate(time) {
    material.uniforms.iTime.value = time * 0.001;
    material.uniforms.iScroll.value = window.scrollY / 2000;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// --- 6. PULSE ENGINE ---
const pulseBtn = document.getElementById('pulse-trigger');
if (pulseBtn) {
    pulseBtn.addEventListener('click', () => {
        gsap.to(material.uniforms.iPulse, {
            value: 1,
            duration: 0.1,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(material.uniforms.iPulse, {
                    value: 0,
                    duration: 2.0,
                    ease: "expo.out"
                });
            }
        });
        
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#6C5CE7', '#0984E3']
        });
    });
}

// Resize & Mouse
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousemove', (e) => {
    material.uniforms.iMouse.value.set(e.clientX, window.innerHeight - e.clientY);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            lenis.scrollTo(target);
        }
    });
});
