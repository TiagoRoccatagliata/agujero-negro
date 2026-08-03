import { BEATS } from './guion.js';

// ============================================================================
//  MODO PRESENTACIÓN  ·  el video, entero, adentro de la página
// ============================================================================
//
//  POR QUÉ EXISTE ESTO
//  -------------------
//  La idea es grabar el video de una sola pasada y no editar NADA. Para eso
//  todo lo que normalmente harías en el editor tiene que pasar en vivo:
//
//    · los cortes entre planos  → fundido corto a negro cuando el salto de
//                                 cámara es grande (parece montaje)
//    · los títulos              → entran y salen solos
//    · el código en pantalla    → panel a la derecha, con la línea importante
//                                 resaltada y el resto atenuado
//    · el encuadre              → cuando aparece el panel, el agujero negro se
//                                 corre (a la izquierda en apaisado, hacia
//                                 arriba en vertical) con setViewOffset, así
//                                 no queda tapado
//    · la entrada y la salida   → fundido desde negro al empezar, fundido a
//                                 negro al terminar. Arrancás a grabar, apretás
//                                 P, y cortás cuando la pantalla ya está negra.
//
//  El contenido está en guion.js (el video largo) y en shorts.js (los
//  verticales para TikTok / Shorts). El motor es el mismo para los dos.
// ============================================================================

// Cuánto se corre el encuadre cuando hay panel, como fracción del ancho (en
// apaisado, hacia el costado) o del alto (en vertical, hacia arriba).
const SHIFT = 0.17;
const SHIFT_V = 0.13;

// Fundidos, en segundos.
const FADE_IN = 1.4;    // desde negro al arrancar
const FADE_OUT = 2.2;   // a negro al terminar
const CUT = 0.42;       // corte entre planos lejanos
const CUT_JUMP = 0.06;  // salto de cámara (en u) a partir del cual hay corte

// ── Resaltado de sintaxis ──────────────────────────────────────────────────
// Mínimo a propósito: se aplica LÍNEA POR LÍNEA, así que no soporta
// comentarios /* */ multilínea. En los snippets usamos solo //.

const KW_JS = new Set(['const', 'let', 'var', 'function', 'return', 'export', 'import',
    'from', 'new', 'if', 'else', 'for', 'while', 'break', 'true', 'false', 'null', 'class']);
const KW_GLSL = new Set(['void', 'uniform', 'varying', 'const', 'in', 'out', 'inout',
    'return', 'if', 'else', 'for', 'while', 'break', 'continue', 'true', 'false',
    'precision', 'highp', 'discard']);
const TYPES = new Set(['float', 'int', 'bool', 'vec2', 'vec3', 'vec4', 'mat2', 'mat3',
    'mat4', 'sampler2D']);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function highlight(line, lang) {
    const kw = lang === 'glsl' ? KW_GLSL : KW_JS;
    // comentario | string | número | palabra
    const re = /(\/\/.*)|('[^']*'|"[^"]*"|`[^`]*`)|(\b\d+\.?\d*(?:[eE][-+]?\d+)?\b)|([A-Za-z_]\w*)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(line)) !== null) {
        out += esc(line.slice(last, m.index));
        last = re.lastIndex;
        if (m[1]) out += `<i class="c">${esc(m[1])}</i>`;
        else if (m[2]) out += `<i class="s">${esc(m[2])}</i>`;
        else if (m[3]) out += `<i class="n">${esc(m[3])}</i>`;
        else {
            const w = m[4];
            if (kw.has(w)) out += `<i class="k">${w}</i>`;
            else if (TYPES.has(w)) out += `<i class="t">${w}</i>`;
            else if (line[re.lastIndex] === '(') out += `<i class="f">${w}</i>`;
            else if (/^u[A-Z]/.test(w)) out += `<i class="u">${w}</i>`;   // uniforms
            else out += esc(w);
        }
    }
    return out + esc(line.slice(last));
}

function renderChunk(chunk, code) {
    const first = parseInt(chunk.lines, 10) || 1;
    const focus = new Set(chunk.focus || []);
    const lines = code.split('\n').map((ln, i) => {
        const cls = focus.size === 0 ? 'ln' : (focus.has(i + 1) ? 'ln on' : 'ln off');
        return `<div class="${cls}" style="--i:${i}">`
            + `<span class="no">${first + i}</span>`
            + `<span class="tx">${highlight(ln, chunk.lang) || '&nbsp;'}</span>`
            + `</div>`;
    }).join('');
    // Un bloque `live` se repinta todo el tiempo, así que le apagamos la
    // animación de entrada: si no, parpadearía en cada repintado.
    return `<div class="chunk${chunk.live ? ' no-anim' : ''}">
      <div class="chunk-head">
        <span class="file">${esc(chunk.file)}</span>
        <span class="range">línea ${first}</span>
      </div>
      <div class="code">${lines}</div>
    </div>`;
}

// ── El motor ────────────────────────────────────────────────────────────────

/**
 * @param {object} deps
 * @param {*} deps.rig        el rig de camera-rig.js
 * @param {*} deps.params     los params de blackhole.js
 * @param {*} deps.material   el ShaderMaterial, para sincronizar uniforms
 * @param {Function} deps.syncParams
 */
export function createPresentation({ rig, params, material, syncParams, vertical = false }) {
    // --- DOM ---
    const root = document.createElement('div');
    root.className = 'pres' + (vertical ? ' vertical' : '');
    // `vertical` puede cambiar en caliente (tecla V), así que no es const.
    root.innerHTML = `
    <div class="pres-stack">
      <div class="pres-panel"></div>
      <div class="pres-note"><div class="note-title"></div><div class="note-text"></div></div>
    </div>
    <div class="pres-title"><div class="kicker"></div><div class="head"></div></div>
    <div class="pres-say"></div>
    <div class="pres-bar"><i></i></div>
    <div class="pres-fade"></div>`;
    document.body.appendChild(root);

    const elPanel = root.querySelector('.pres-panel');
    const elNote = root.querySelector('.pres-note');
    const elNoteTitle = root.querySelector('.note-title');
    const elNoteText = root.querySelector('.note-text');
    const elTitle = root.querySelector('.pres-title');
    const elKicker = root.querySelector('.kicker');
    const elHead = root.querySelector('.head');
    const elSay = root.querySelector('.pres-say');
    const elBar = root.querySelector('.pres-bar i');
    const elFade = root.querySelector('.pres-fade');

    // --- estado ---
    // `list` es la lista de beats que se está reproduciendo: el guion largo
    // de guion.js, o el de un short de shorts.js. El motor no sabe cuál es.
    let list = BEATS;
    let total = 0;
    let active = false;
    let idx = 0;
    let t = 0;            // segundos dentro del beat actual
    let elapsed = 0;      // segundos totales desde el arranque
    let intro = 0;        // resto del fundido de entrada
    let outro = 0;        // resto del fundido de salida
    let done = false;     // ya terminó: se queda en negro hasta que salgas
    let cut = 0;          // resto del corte a negro
    let pending = null;   // beat que espera al medio del corte
    let titleTimer = 0;
    let showSay = false;
    let frameShift = 0;   // objetivo del desplazamiento de encuadre
    let noteAt = -1;      // cuándo (0..1 del beat) aparece la nota

    // Lo que ve `action` de cada beat. Si más adelante querés animar otra
    // perilla en vivo, agregala acá.
    const ctx = {
        get lensing() { return params.lensing; },
        setLensing(v) {
            if (params.lensing === v) return;
            params.lensing = v;
            syncParams(material);
        },
    };

    function paintPanel(beat) {
        if (!beat.panel || beat.panel.length === 0) {
            elPanel.classList.remove('show');
            elPanel.innerHTML = '';
            frameShift = 0;
            return;
        }
        elPanel.innerHTML = beat.panel
            .map(c => renderChunk(c, c.live ? c.live(ctx) : c.code))
            .join('');
        // reiniciamos la animación de entrada de las líneas
        void elPanel.offsetWidth;
        elPanel.classList.add('show');
        frameShift = vertical ? SHIFT_V : SHIFT;
    }

    // Los bloques `live` se repintan solo cuando su texto cambió de verdad,
    // así no reconstruimos HTML 60 veces por segundo al pedo.
    const liveCache = new Map();
    let liveClock = 0;
    function updateLive(beat, dt) {
        if (!beat.panel) return;
        liveClock += dt;
        if (liveClock < 0.05) return;   // ~20 repintados por segundo alcanzan
        liveClock = 0;
        beat.panel.forEach((c, i) => {
            if (!c.live) return;
            const code = c.live(ctx);
            if (liveCache.get(i) === code) return;
            liveCache.set(i, code);
            const node = elPanel.children[i];
            if (node) node.outerHTML = renderChunk(c, code);
        });
    }

    function apply(i) {
        idx = i;
        t = 0;
        liveCache.clear();
        const beat = list[i];

        rig.seekU(beat.cam.u);
        rig.setSpeedTo(beat.cam.speed);

        paintPanel(beat);

        // Nota al margen: el dato lindo que no entra en lo que estás diciendo.
        // Aparece más tarde que el código a propósito, para que el ojo llegue.
        elNote.classList.remove('show');
        noteAt = beat.note ? (beat.note.at ?? 0.35) : -1;
        if (beat.note) {
            elNoteTitle.textContent = beat.note.title || '';
            elNoteText.textContent = beat.note.text;
        }

        elKicker.textContent = beat.kicker || '';
        elHead.textContent = beat.title || '';
        elTitle.classList.toggle('show', !!(beat.title || beat.kicker));
        // En vertical el título es el subtítulo del short: se queda todo el
        // bloque. En apaisado se va solo, como un rótulo de documental.
        titleTimer = vertical ? Infinity : 7.0;

        elSay.textContent = beat.say.replace(/\s+/g, ' ').trim();
    }

    function goTo(i) {
        if (i < 0) return;
        if (i >= list.length) { finish(); return; }
        // si ya hay un beat esperando al medio de un corte, comparamos contra
        // ESE (si no, apretar → dos veces seguidas avanzaría uno solo)
        const from = pending !== null ? pending : idx;
        const jump = Math.abs(list[i].cam.u - list[from].cam.u);
        if (active && jump > CUT_JUMP) {
            cut = CUT;          // apply() se ejecuta al medio, en update()
            pending = i;
        } else {
            apply(i);
        }
    }

    function finish() {
        outro = FADE_OUT;
        elPanel.classList.remove('show');
        elNote.classList.remove('show');
        elTitle.classList.remove('show');
        frameShift = 0;
    }

    function update(dt) {
        if (!active || done) return;   // terminado = pantalla negra, y nada más

        // fundido de entrada
        if (intro > 0) intro = Math.max(0, intro - dt);

        // fundido final: cuando termina queda en negro hasta que aprietes Esc.
        // Ese negro es el final del video: cortá la grabación ahí.
        if (outro > 0) {
            outro = Math.max(0, outro - dt);
            elFade.style.opacity = String(1 - outro / FADE_OUT);
            elBar.style.width = '100%';
            if (outro === 0) { done = true; elFade.style.opacity = '1'; }
            return;
        }

        // corte entre planos: negro al 50% del camino, y ahí cambiamos de beat
        if (cut > 0) {
            cut = Math.max(0, cut - dt);
            if (pending !== null && cut <= CUT / 2) { apply(pending); pending = null; }
        }

        const beat = list[idx];
        t += dt;
        elapsed += dt;

        const p = Math.min(t / beat.seconds, 1);
        if (beat.action) beat.action(ctx, p);
        updateLive(beat, dt);

        if (noteAt >= 0 && p >= noteAt) { elNote.classList.add('show'); noteAt = -1; }

        if (titleTimer > 0) {
            titleTimer -= dt;
            if (titleTimer <= 0) elTitle.classList.remove('show');
        }

        if (t >= beat.seconds && pending === null) goTo(idx + 1);

        // opacidad del negro: el mayor entre entrada y corte
        const fadeCut = cut > 0 ? 1 - Math.abs(cut - CUT / 2) / (CUT / 2) : 0;
        const fadeIn = intro > 0 ? intro / FADE_IN : 0;
        elFade.style.opacity = String(Math.max(fadeCut, fadeIn));

        elBar.style.width = (100 * Math.min(elapsed / total, 1)) + '%';
    }

    return {
        update,
        get active() { return active; },

        /**
         * Cuánto correr el encuadre, como fracción del ancho (apaisado) o del
         * alto (vertical). Lo lee main.js y lo aplica con setViewOffset.
         */
        get frameShiftX() { return active && !vertical ? frameShift : 0; },
        get frameShiftY() { return active && vertical ? frameShift : 0; },

        /**
         * Arranca una lista de beats. Sin argumento reproduce el guion largo.
         * Los shorts pasan la lista del short elegido.
         */
        play(beats = BEATS) {
            list = beats;
            total = beats.reduce((a, b) => a + b.seconds, 0);
            active = true;
            idx = 0; elapsed = 0; intro = FADE_IN; outro = 0; cut = 0; pending = null;
            done = false;
            root.classList.add('on');
            elFade.style.opacity = '1';
            document.body.style.cursor = 'none';   // que no salga en la toma
            if (!rig.active) rig.toggle();
            if (rig.paused) rig.pause();
            apply(0);
        },

        start() { if (!active) this.play(BEATS); },

        stop() {
            if (!active) return;
            active = false;
            root.classList.remove('on');
            elPanel.classList.remove('show');
            elNote.classList.remove('show');
            elTitle.classList.remove('show');
            elFade.style.opacity = '0';
            ctx.setLensing(1);
            rig.setSpeedTo(1);
        },

        next() { if (active && outro === 0) goTo((pending !== null ? pending : idx) + 1); },
        prev() { if (active && outro === 0) goTo((pending !== null ? pending : idx) - 1); },

        /**
         * Cambia entre apaisado y vertical sin recargar. Lo usa la tecla V.
         * `preview` recorta la ventana a una franja 9:16 centrada: el encuadre
         * que se ve ahí es EXACTAMENTE el de una ventana vertical de verdad,
         * porque el fov de three.js es el vertical y la franja tiene la misma
         * altura que la ventana.
         */
        setVertical(v, preview) {
            vertical = v;
            root.classList.toggle('vertical', v);
            root.classList.toggle('preview', v && preview);
            if (active) apply(idx);   // re-encuadrar lo que está en pantalla
        },

        /** Teleprompter: el texto del beat, sobre la pantalla. Solo para ensayar. */
        toggleSay() {
            showSay = !showSay;
            root.classList.toggle('say-on', showSay);
        },

        /** Nombre del beat actual, para el HUD. */
        get label() { return `${idx + 1}/${list.length} · ${list[idx].id}`; },
    };
}
