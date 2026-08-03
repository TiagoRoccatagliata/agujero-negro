import * as THREE from 'three';

// ============================================================================
//  CÁMARA CINEMATOGRÁFICA
// ============================================================================
//  El problema de mover la cámara con el mouse mientras grabás es que queda
//  tembloroso y se ve el cursor. Esto lo reemplaza por un recorrido definido
//  por keyframes, interpolado con una curva Catmull-Rom (de three.js), así
//  que el movimiento es perfectamente suave y siempre idéntico.
//
//  CÓMO DEFINIR TUS PROPIOS PLANOS
//  -------------------------------
//  Cada keyframe describe DÓNDE está la cámara, en coordenadas esféricas
//  alrededor del agujero negro (que está en el origen):
//
//     dist  distancia al centro, en unidades M (el horizonte está en 2)
//     elev  grados sobre el plano del disco. 0 = exactamente de canto.
//     azim  grados alrededor. Tiene que ir SIEMPRE creciendo.
//     fov   campo de visión. Bajarlo = teleobjetivo, comprime y da drama.
//
//  El tiempo se reparte EN PARTES IGUALES entre keyframes. O sea: si querés
//  que un tramo vaya más lento, agregale más keyframes. Si lo querés más
//  rápido, sacale.
// ============================================================================

export const LOOP_SECONDS = 66;   // duración de una vuelta completa

const KEYFRAMES = [
    // ── PLANO 1 · Revelación: lejos y desde arriba, bajando despacio ──────
    { dist: 52, elev: 38.0, azim: 0, fov: 38, shot: 'Revelación' },
    { dist: 44, elev: 30.0, azim: 45, fov: 38 },
    { dist: 36, elev: 20.0, azim: 95, fov: 40 },

    // ── PLANO 2 · De canto: el disco se aplasta a una línea y los arcos
    //    lensados de arriba y abajo dominan la pantalla. El mejor plano. ───
    { dist: 28, elev: 10.0, azim: 140, fov: 42, shot: 'De canto' },
    { dist: 22, elev: 2.5, azim: 190, fov: 44 },
    { dist: 18, elev: 1.0, azim: 235, fov: 42 },

    // ── PLANO 3 · Acercamiento al borde de la sombra, con teleobjetivo ────
    { dist: 14, elev: 4.0, azim: 275, fov: 36, shot: 'Acercamiento' },
    { dist: 11, elev: 8.0, azim: 305, fov: 30 },

    // ── PLANO 4 · Ascenso: se abre y sube, y cierra el bucle ──────────────
    { dist: 16, elev: 22.0, azim: 330, fov: 40, shot: 'Ascenso' },
    { dist: 30, elev: 34.0, azim: 348, fov: 40 },

    // Repite el primero con azim + 360 para que el bucle cierre sin salto.
    { dist: 52, elev: 38.0, azim: 360, fov: 38 },
];

// Un pelín de deriva orgánica para que no parezca movido por un robot.
// Bajalo a 0 si querés un movimiento matemáticamente limpio.
const DRIFT = 0.09;

// Curvas de interpolación. Empaquetamos los valores en Vector3 solo para
// poder aprovechar la CatmullRomCurve3 de three.js: (dist, elev, azim).
const pathCurve = new THREE.CatmullRomCurve3(
    KEYFRAMES.map(k => new THREE.Vector3(k.dist, k.elev, k.azim)),
    false, 'catmullrom', 0.5
);
const fovCurve = new THREE.CatmullRomCurve3(
    KEYFRAMES.map((k, i) => new THREE.Vector3(i, k.fov, 0)),
    false, 'catmullrom', 0.5
);

// Marcadores de cada plano, para poder saltar con las teclas 1-9.
export const SHOTS = KEYFRAMES
    .map((k, i) => k.shot ? { name: k.shot, u: i / (KEYFRAMES.length - 1) } : null)
    .filter(Boolean);

const _path = new THREE.Vector3();
const _fov = new THREE.Vector3();
const _target = new THREE.Vector3();

export function createCameraRig(camera, controls) {
    let time = 0;
    let active = true;
    let paused = false;
    let speed = 1.0;

    // ENCUADRE VERTICAL (9:16, para TikTok / Shorts)
    // --------------------------------------------------------------------
    // Los `fov` de los keyframes están pensados para una pantalla apaisada.
    // En una ventana vertical el fov de three.js sigue siendo el VERTICAL,
    // así que a lo ancho entra muchísimo menos y el disco se sale por los
    // costados. Lo compensamos de dos maneras a la vez, porque cada una
    // tiene su costo:
    //
    //    alejar la cámara  → no distorsiona, pero achica la sombra
    //    abrir el fov      → mantiene la sombra grande, pero estira los bordes
    //
    // Estos dos números son la mezcla. Subilos si querés más aire.
    let distScale = 1.0;
    let fovScale = 1.0;

    function apply() {
        const u = THREE.MathUtils.clamp(time / LOOP_SECONDS, 0, 1);

        pathCurve.getPoint(u, _path);
        const dist = _path.x * distScale;
        const elev = THREE.MathUtils.degToRad(_path.y);
        const azim = THREE.MathUtils.degToRad(_path.z);

        camera.position.set(
            dist * Math.cos(elev) * Math.sin(azim),
            dist * Math.sin(elev),
            dist * Math.cos(elev) * Math.cos(azim)
        );

        // deriva suave del punto de mira (dos frecuencias que no riman, así
        // el patrón no se hace evidente)
        _target.set(
            Math.sin(time * 0.23) * DRIFT,
            Math.sin(time * 0.31 + 1.7) * DRIFT,
            Math.cos(time * 0.19) * DRIFT
        );
        camera.lookAt(_target);

        const fov = Math.min(fovCurve.getPoint(u, _fov).y * fovScale, 88);
        if (Math.abs(camera.fov - fov) > 1e-4) {
            camera.fov = fov;
            camera.updateProjectionMatrix();
        }
    }

    function update(dt) {
        if (!active || paused) return;
        time = (time + dt * speed) % LOOP_SECONDS;
        apply();
    }

    return {
        update,

        get active() { return active; },
        get paused() { return paused; },
        get speed() { return speed; },
        get time() { return time; },

        /** Nombre del plano que se está viendo ahora. */
        get shotName() {
            const u = time / LOOP_SECONDS;
            let name = SHOTS[0]?.name ?? '';
            for (const s of SHOTS) if (u >= s.u) name = s.name;
            return name;
        },

        /** Alterna entre recorrido cinematográfico y control libre con mouse. */
        toggle() {
            active = !active;
            controls.enabled = !active;
            document.body.style.cursor = active ? 'none' : '';
            if (active) {
                apply();
            } else {
                // al pasar a libre, que OrbitControls arranque desde acá
                controls.target.set(0, 0, 0);
                controls.update();
            }
            return active;
        },

        pause() { paused = !paused; return paused; },
        restart() { time = 0; apply(); },

        /** Salta al plano n (1-based), para elegir toma mientras grabás. */
        goToShot(n) {
            const s = SHOTS[n - 1];
            if (!s) return null;
            time = s.u * LOOP_SECONDS;
            apply();
            return s.name;
        },

        /**
         * Salta a un punto cualquiera del recorrido, con u en 0..1.
         * Lo usa el modo presentación para plantar la cámara donde quiere
         * cada beat del guion, sin depender de los marcadores de plano.
         */
        seekU(u) {
            time = THREE.MathUtils.clamp(u, 0, 1) * LOOP_SECONDS;
            apply();
        },

        setSpeed(mult) {
            speed = THREE.MathUtils.clamp(speed * mult, 0.15, 4);
            return speed;
        },

        /** Velocidad absoluta (la presentación fija una por beat). */
        setSpeedTo(v) {
            speed = THREE.MathUtils.clamp(v, 0.05, 4);
            return speed;
        },

        /** Encuadre: 1 y 1 en apaisado, más en vertical. Ver arriba. */
        setFraming(dScale, fScale) {
            distScale = dScale;
            fovScale = fScale;
            apply();
        },

        init() {
            controls.enabled = false;
            document.body.style.cursor = 'none';
            apply();
        },
    };
}
