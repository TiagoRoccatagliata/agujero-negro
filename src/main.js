import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { createBlackHole, params, syncParams } from './blackhole.js';
import { createCameraRig, SHOTS } from './camera-rig.js';
import { createPresentation } from './presentacion.js';
import { SHORTS, shortSeconds } from './shorts.js';
import './style.css';

// ============================================================================
//  ESTE ARCHIVO SOLO ARMA LA ESCENA Y CORRE EL BUCLE.
//  La física y el aspecto están en blackhole.js
//  El recorrido de cámara está en camera-rig.js
// ============================================================================

// ── Vertical (TikTok / Shorts) ──────────────────────────────────────────────
// Hay dos formas de grabar en 9:16, y las dos dan el MISMO encuadre:
//
//   · Ventana angosta (o ?shorts): la app se da cuenta sola. Capturás la
//     ventana con OBS y el archivo ya sale vertical. Es la mejor calidad.
//   · Tecla V: recorta la pantalla a una franja 9:16 centrada y tapa los
//     costados. Grabás igual y recortás la fuente en OBS, una sola vez.
//
// Son equivalentes porque el fov de three.js es el VERTICAL: la franja tiene
// la misma altura que la pantalla, así que el campo de visión no cambia.
let VERTICAL = new URLSearchParams(location.search).has('shorts')
    || window.innerHeight > window.innerWidth;

// Perillas del encuadre vertical (ver camera-rig.js). Más = más aire.
const V_DIST = 1.20;   // cuánto se aleja la cámara
const V_FOV = 1.25;    // cuánto se abre el fov

// Resolución del render. En una pantalla Retina, 2 significa renderizar 4x más
// píxeles: hermoso pero pesado para un ray marcher. 1.5 es un buen equilibrio.
// Para grabar en máxima calidad subilo a 2 y bajá STEPS si hace falta.
const RESOLUTION = 1.5;

// ── Renderer ────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, RESOLUTION));
// Tone mapping cinematográfico: el disco emite valores muy por encima de 1
// (es HDR de verdad), y esto los comprime con un rolloff suave en vez de
// recortarlos a blanco plano. Es gran parte de que se vea "de película".
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// ── Cámara ──────────────────────────────────────────────────────────────────
// Esta cámara no filma objetos (no hay objetos). Le da al shader el punto de
// vista: posición, orientación y FOV.
const camera = new THREE.PerspectiveCamera(
    40, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 12, 40);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 6;    // la sombra ocupa ~5 unidades: más cerca es raro
controls.maxDistance = 90;

// ── El agujero negro ────────────────────────────────────────────────────────
const bh = createBlackHole();

// ── Post-procesado ──────────────────────────────────────────────────────────
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(bh.scene, bh.camera));

const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.55,  // fuerza
    0.50,  // radio
    1.00   // umbral: solo florece lo que de verdad supera el blanco
);
composer.addPass(bloom);

// OutputPass va SIEMPRE último: aplica el tone mapping y convierte a sRGB.
composer.addPass(new OutputPass());

// ── Cámara cinematográfica ──────────────────────────────────────────────────
const rig = createCameraRig(camera, controls);
rig.init();

// ── Presentación (el video, armado adentro de la página) ────────────────────
const pres = createPresentation({
    rig, params, material: bh.material, syncParams, vertical: VERTICAL,
});

// La ventana ya vertical no necesita máscara; la previsualización sí.
function setVertical(v) {
    VERTICAL = v;
    const preview = v && window.innerWidth > window.innerHeight;
    rig.setFraming(v ? V_DIST : 1, v ? V_FOV : 1);
    pres.setVertical(v, preview);
}
setVertical(VERTICAL);
// para poder manejarla desde la consola del navegador mientras ensayás:
//   pres.play(SHORTS[3].beats)   → arranca el short 4 sin tocar el teclado
window.pres = pres;
window.SHORTS = SHORTS;

// ── HUD ─────────────────────────────────────────────────────────────────────
const hud = document.createElement('div');
hud.className = 'hud';
document.body.appendChild(hud);

const keysHelp = () => VERTICAL ? [
    ['P', 'grabar el short elegido'],
    ['V', 'volver a apaisado'],
    ['1-' + SHORTS.length, 'elegir short'],
    ['→ ←', 'bloque siguiente / anterior'],
    ['Esc', 'salir'],
    ['T', 'teleprompter (solo para ensayar)'],
    ['H', 'ocultar este panel (para grabar)'],
] : [
    ['P', 'PRESENTACIÓN: arrancar el video'],
    ['→ ←', 'beat siguiente / anterior'],
    ['Esc', 'salir de la presentación'],
    ['T', 'teleprompter (solo para ensayar)'],
    ['V', 'modo shorts: recortar a 9:16'],
    ['C', 'cámara cinematográfica ↔ mouse libre'],
    ['1-' + SHOTS.length, 'saltar a un plano'],
    ['Espacio', 'pausar'],
    ['R', 'reiniciar el recorrido'],
    ['[ ]', 'más lento / más rápido'],
    ['G', 'apagar / encender la gravedad'],
    ['H', 'ocultar este panel (para grabar)'],
];

// En vertical grabás UN short por vez: este es el que está elegido.
let shortIdx = 0;

function drawHud() {
    const mode = pres.active
        ? `${VERTICAL ? SHORTS[shortIdx].nombre : 'Presentación'} · ${pres.label}`
        : (VERTICAL
            ? `SHORTS · ${shortIdx + 1}. ${SHORTS[shortIdx].nombre} (${shortSeconds(SHORTS[shortIdx])}s)`
            : (rig.active ? `Cinematográfica · ${rig.shotName}` : 'Mouse libre'));
    const lista = VERTICAL && !pres.active
        ? `<table class="hud-shorts">${SHORTS.map((sh, i) =>
            `<tr class="${i === shortIdx ? 'sel' : ''}"><td><kbd>${i + 1}</kbd></td>` +
            `<td>${sh.nombre} <span>${shortSeconds(sh)}s</span></td></tr>`).join('')}</table>`
        : '';

    hud.innerHTML = `
    <div class="hud-title">${mode}${rig.paused ? ' · PAUSA' : ''}</div>
    <div class="hud-meta">
      ${rig.speed.toFixed(2)}× &nbsp;·&nbsp; ${rig.time.toFixed(1)}s
      &nbsp;·&nbsp; gravedad ${params.lensing ? 'ON' : 'OFF'}
    </div>
    ${lista}
    <table>${keysHelp().map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join('')}</table>
  `;
}
drawHud();

// se esconde solo a los 7 segundos, así no arruina la toma si te olvidás
let hudTimer = setTimeout(() => hud.classList.add('hidden'), 7000);

function flashHud() {
    hud.classList.remove('hidden');
    drawHud();
    clearTimeout(hudTimer);
    hudTimer = setTimeout(() => hud.classList.add('hidden'), 2500);
}

// ── Teclas ──────────────────────────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();

    // --- presentación ---
    // P arranca. Una vez adentro, las flechas mandan: si venís hablando más
    // rápido que el guion, → pasa al siguiente beat sin esperar.
    if (k === 'p') {
        if (pres.active) pres.stop();
        else {
            pres.play(VERTICAL ? SHORTS[shortIdx].beats : undefined);
            hud.classList.add('hidden');
        }
        clearTimeout(hudTimer);
        return;
    }

    // V alterna el modo shorts: recorta a 9:16 y cambia todo el layout
    if (k === 'v' && !pres.active) {
        setVertical(!VERTICAL);
        flashHud();
        return;
    }
    if (pres.active) {
        if (e.key === 'ArrowRight') { e.preventDefault(); pres.next(); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); pres.prev(); return; }
        if (e.key === 'Escape') { pres.stop(); return; }
        if (k === 't') { pres.toggleSay(); return; }
    }

    if (k === 'h') {
        hud.classList.toggle('hidden');
        clearTimeout(hudTimer);
        return;
    }
    if (k === 'c') { rig.toggle(); flashHud(); return; }
    if (k === ' ') { e.preventDefault(); rig.pause(); flashHud(); return; }
    if (k === 'r') { rig.restart(); flashHud(); return; }
    if (k === '[') { rig.setSpeed(1 / 1.25); flashHud(); return; }
    if (k === ']') { rig.setSpeed(1.25); flashHud(); return; }

    // apagar la gravedad: la luz viaja recta y se ve un disco plano y común.
    // Encenderla de nuevo es la mejor forma de explicar el lente gravitacional.
    if (k === 'g') {
        params.lensing = params.lensing ? 0 : 1;
        syncParams(bh.material);
        flashHud();
        return;
    }

    const n = parseInt(k, 10);

    // En vertical los números eligen QUÉ short vas a grabar (después, P).
    if (VERTICAL) {
        if (n >= 1 && n <= SHORTS.length) {
            shortIdx = n - 1;
            rig.seekU(SHORTS[shortIdx].beats[0].cam.u);   // preview del primer plano
            flashHud();
        }
        return;
    }

    if (n >= 1 && n <= SHOTS.length) {
        if (!rig.active) rig.toggle();
        rig.goToShot(n);
        flashHud();
    }
});

// ── Resize ──────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// ── Bucle ───────────────────────────────────────────────────────────────────
let last = performance.now();
let simTime = 0;   // reloj propio: se congela con Espacio, junto con la cámara
let shift = 0;     // desplazamiento actual del encuadre (ver abajo)
let shiftY = 0;

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1);   // por si la pestaña se durmió
    last = now;
    if (!rig.paused) simTime += dt;

    rig.update(dt);
    pres.update(rig.paused ? 0 : dt);
    if (!rig.active) controls.update();

    // Encuadre descentrado. Cuando la presentación muestra código, corremos el
    // frustum con setViewOffset para que el agujero negro se vaya a la
    // izquierda (apaisado) o hacia arriba (vertical) y no quede tapado. Es un
    // desplazamiento del encuadre, no un movimiento de cámara: la física no se
    // entera. Va con lerp para que la transición sea suave, y ANTES de copiar
    // uCamInvProj al shader.
    const ease = Math.min(1, dt * 3.0);
    shift += (pres.frameShiftX - shift) * ease;
    shiftY += (pres.frameShiftY - shiftY) * ease;
    if (Math.abs(shift) > 1e-4 || Math.abs(shiftY) > 1e-4) {
        const W = window.innerWidth, H = window.innerHeight;
        camera.setViewOffset(W, H, W * shift, H * shiftY, W, H);
    } else if (camera.view && camera.view.enabled) {
        camera.clearViewOffset();
    }

    camera.updateMatrixWorld();

    // le pasamos el punto de vista al shader
    const u = bh.material.uniforms;
    u.uTime.value = simTime;
    u.uCamPos.value.copy(camera.position);
    u.uCamInvProj.value.copy(camera.projectionMatrix).invert();
    u.uCamWorld.value.copy(camera.matrixWorld);

    if (!hud.classList.contains('hidden')) drawHud();

    composer.render();
}
animate();
