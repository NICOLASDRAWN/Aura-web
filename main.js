import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';
import SplitType from 'split-type';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

// --- 1. LENIS SMOOTH SCROLL ---
const lenis = new Lenis({
    duration: 1.2,
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
gsap.ticker.lagSmoothing(0);

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

    const interactiveElements = document.querySelectorAll('a, button, .magnetic');
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

// Randomize HUD data
const hudItems = document.querySelectorAll('.hud-item');
setInterval(() => {
    if (hudItems[0]) hudItems[0].textContent = `LAT: ${(4.6 + Math.random() * 0.01).toFixed(4)}° N`;
    if (hudItems[1]) hudItems[1].textContent = `LON: ${(74.08 + Math.random() * 0.01).toFixed(4)}° W`;
}, 2000);

// --- 4. KINETIC TYPOGRAPHY (V4.0) ---
const kineticTexts = new SplitType('.kinetic-text', { types: 'chars' });

gsap.from(kineticTexts.chars, {
    y: 100,
    rotateZ: 10,
    opacity: 0,
    stagger: 0.03,
    duration: 1.5,
    ease: "expo.out",
    scrollTrigger: {
        trigger: '.hero',
        start: "top 80%",
    }
});

// --- 5. CINEMATIC THREE.JS ENGINE (Shaders V4.0) ---
const canvas = document.getElementById('liquid-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const fragmentShader = `
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec2 iMouse;
    uniform float iScroll;
    uniform float iPulse;

    varying vec2 vUv;

    // Simplex Noise
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
        
        // 1. Chromatic Aberration driven by scroll/pulse
        float offset = 0.002 * (1.0 + iScroll * 2.0 + iPulse * 5.0);
        
        float r = snoise(uv * 2.0 + iTime * 0.1);
        float g = snoise(uv * 2.0 + iTime * 0.1 + offset);
        float b = snoise(uv * 2.0 + iTime * 0.1 - offset);
        
        float liquid = r; // base liquid factor
        
        // 2. Base Colors (Aura Palette Refined)
        vec3 col1 = vec3(0.98, 0.98, 0.97); // Off-white
        vec3 col2 = vec3(0.42, 0.36, 0.95); // Deep Purple
        vec3 col3 = vec3(0.35, 0.72, 0.99); // Electric Blue
        
        vec3 finalCol = mix(col1, col2, smoothstep(0.1, 0.6, r));
        finalCol = mix(finalCol, col3, smoothstep(0.4, 0.9, g));
        
        // 3. Film Grain
        float grain = (random(uv + iTime) - 0.5) * 0.05;
        finalCol += grain;
        
        gl_FragColor = vec4(finalCol, 1.0);
    }
`;

const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    iMouse: { value: new THREE.Vector2(0, 0) },
    iScroll: { value: 0 },
    iPulse: { value: 0 }
};

const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader,
    transparent: true
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(mesh);

function animate(time) {
    uniforms.iTime.value = time * 0.001;
    uniforms.iScroll.value = window.scrollY / document.body.scrollHeight;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// --- 6. PULSE ENGINE ---
const pulseBtn = document.getElementById('pulse-trigger');
if (pulseBtn) {
    pulseBtn.addEventListener('click', () => {
        gsap.to(uniforms.iPulse, {
            value: 1,
            duration: 0.1,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(uniforms.iPulse, {
                    value: 0,
                    duration: 1.5,
                    ease: "expo.out"
                });
            }
        });
        
        confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#6C5CE7', '#0984E3']
        });
    });
}

// Form logic
const form = document.getElementById('waitlist-form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        btn.textContent = 'Aura Sincronizada';
        btn.style.background = '#6C5CE7';
    });
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousemove', (e) => {
    uniforms.iMouse.value.set(e.clientX, window.innerHeight - e.clientY);
});
