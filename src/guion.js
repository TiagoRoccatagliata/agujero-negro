// ============================================================================
//  GUION DEL VIDEO  ·  el contenido de la presentación
// ============================================================================
//
//  Esto es SOLO contenido: qué se ve, qué código se muestra y qué decís.
//  El motor que lo reproduce está en presentacion.js.
//
//  CÓMO SE LEE UN BEAT
//  -------------------
//    seconds  cuánto dura. Si hablás más rápido, → adelanta; ← retrocede.
//    cam.u    dónde arranca la cámara dentro del recorrido de camera-rig.js,
//             en 0..1 (0 = Revelación, 0.3 = De canto, 0.6 = Acercamiento,
//             0.8 = Ascenso). Si el salto contra el beat anterior es grande,
//             la presentación mete sola un corte a negro: parece montado.
//    cam.speed  velocidad del recorrido en ese beat. Bajo = contemplativo.
//    panel    array de bloques de código. Vacío/ausente = pantalla limpia.
//    focus    líneas a resaltar, 1-based DENTRO del snippet (no del archivo).
//    note     el dato lindo que no entra en lo que estás diciendo. Aparece
//             solo, más tarde que el código (`at` = en qué punto del beat),
//             para que el ojo primero lea el código y después la nota.
//    live     bloque que se regenera cada frame (para mostrar un valor que
//             está cambiando en vivo). Recibe el estado y devuelve el código.
//    action   se llama cada frame con p = progreso del beat (0..1). Acá van
//             las animaciones de parámetros.
//    say      lo que decís. Se usa para el teleprompter (tecla T) y es lo
//             mismo que está en GUION.md para leer desde el celular.
//
//  OJO: los snippets están COPIADOS de los archivos, no leídos de ellos. Si
//  editás el código de verdad, actualizá también el snippet de acá.
// ============================================================================

export const BEATS = [

    // ───────────────────────────────────────────────────────────────────────
    //  1 · APERTURA — pantalla limpia. Que respire y que se vea el bicho.
    // ───────────────────────────────────────────────────────────────────────
    {
        id: 'apertura',
        kicker: 'three.js · WebGL',
        title: 'Un agujero negro con física de verdad',
        seconds: 18,
        cam: { u: 0.00, speed: 0.45 },
        say: `Esto es un agujero negro de Schwarzschild. La luz de las estrellas
se está curvando, hay un anillo de fotones pegado al borde de la sombra, y un
lado del disco brilla muchísimo más que el otro. Nada de eso está dibujado.
Y lo más raro de todo: en esta escena no hay ni un solo objeto 3D.`,
    },

    // ───────────────────────────────────────────────────────────────────────
    //  2 · EL TRUCO — un rectángulo y un programa por píxel.
    // ───────────────────────────────────────────────────────────────────────
    {
        id: 'quad',
        kicker: 'El truco',
        title: 'Un rectángulo y un programa por píxel',
        seconds: 26,
        cam: { u: 0.12, speed: 0.35 },
        panel: [
            {
                file: 'src/blackhole.js', lines: '381', lang: 'js',
                focus: [8, 9],
                code: `const material = new THREE.ShaderMaterial({
  uniforms,          // acá le pasamos la cámara y los parámetros
  vertexShader,
  fragmentShader,
  depthTest: false,
});

// un rectángulo de 2x2 que tapa exactamente la pantalla
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
quad.frustumCulled = false;   // el vertex shader ignora la cámara`,
            },
            {
                file: 'src/blackhole.js', lines: '370', lang: 'glsl',
                focus: [4],
                code: `varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);  // ya está en pantalla`,
            },
        ],
        note: {
            title: 'La cuenta',
            text: 'El vertex shader corre 4 veces por frame, una por vértice. El fragment shader, unos 2 millones: uno por píxel. A 60 fps son 120 millones de fotones por segundo.',
            at: 0.42,
        },
        say: `Lo único que hay en la escena es un rectángulo que tapa la pantalla,
con un ShaderMaterial de three.js. Fijate en el vertex shader: no multiplica por
ninguna matriz, ni mira la cámara. Escupe las coordenadas de pantalla directo.
Así que todo lo que ves lo decide el fragment shader, que corre una vez por cada
píxel. Dos millones de veces por frame.`,
    },

    // ───────────────────────────────────────────────────────────────────────
    //  3 · UN FOTÓN POR PÍXEL — el ray marcher, en tres salidas posibles.
    // ───────────────────────────────────────────────────────────────────────
    {
        id: 'foton',
        kicker: 'Qué hace ese programa',
        title: 'Dispara un fotón y lo sigue',
        seconds: 26,
        cam: { u: 0.21, speed: 0.28 },
        panel: [
            {
                file: 'src/blackhole.js', lines: '292', lang: 'glsl',
                focus: [13, 14, 15],
                code: `void main(){
  // el rayo que sale de la cámara por ESTE píxel
  vec2 ndc = vUv * 2.0 - 1.0;
  vec4 v   = uCamInvProj * vec4(ndc, -1.0, 1.0);
  vec3 dir = normalize((uCamWorld * vec4(v.xyz / v.w, 0.0)).xyz);
  vec3 pos = uCamPos;

  // momento angular del fotón: se calcula UNA vez y se conserva
  float h2 = dot(cross(pos, dir), cross(pos, dir));

  for (int i = 0; i < STEPS; i++){
    // ... curvamos el fotón y avanzamos un paso ...
    if (rmin < uRs) { captured = true; break; }   // -> negro
    if (prev.y * pos.y < 0.0) { /* cruzó el disco */ }  // -> gas
    if (rn > 120.0) break;                        // -> estrellas
  }
}`,
            },
        ],
        note: {
            title: 'Al revés a propósito',
            text: 'La luz real sale del disco y llega al ojo. Nosotros la mandamos del ojo hacia afuera porque así solo calculamos los fotones que de verdad vas a ver. Las ecuaciones son reversibles: da lo mismo.',
            at: 0.40,
        },
        say: `Y lo que hace por cada píxel es esto: reconstruye el rayo que sale de
la cámara por ese píxel, y dispara un fotón hacia afuera. Al revés de como viaja
la luz en la realidad, pero da lo mismo. Después lo sigue paso a paso, y al final
pregunta dónde terminó. Si cayó dentro del horizonte, negro: eso es la sombra.
Si cruzó el plano del disco, gas incandescente. Si se escapó, estrellas.`,
    },

    // ───────────────────────────────────────────────────────────────────────
    //  4 · LA LÍNEA — el corazón del video.
    // ───────────────────────────────────────────────────────────────────────
    {
        id: 'gravedad',
        kicker: 'Toda la gravedad',
        title: 'Son estas dos líneas',
        seconds: 32,
        cam: { u: 0.27, speed: 0.22 },
        panel: [
            {
                file: 'src/blackhole.js', lines: '145', lang: 'glsl',
                focus: [3, 9],
                code: `//  Geodésica nula de Schwarzschild:
//
//      a = -3/2 · h² · r̂ / r⁴
//
//  h es el momento angular del fotón, y se conserva.

vec3 gravAccel(vec3 p, float h2){
  float r2 = max(dot(p, p), 1e-4);
  return -1.5 * uLensing * h2 * p / (r2 * r2 * sqrt(r2));
}`,
            },
        ],
        note: {
            title: 'El anillo de fotones',
            text: 'A r = 3M la curvatura es tan justa que la luz orbita en círculo. Los fotones que pasan por ahí dan una vuelta o más antes de escaparse: ese es el anillo fino pegado al borde de la sombra.',
            at: 0.45,
        },
        say: `Y acá está todo el agujero negro. Esta función. Es la geodésica nula
de Schwarzschild: la aceleración de un fotón es menos tres medios, por su momento
angular al cuadrado, sobre erre a la cuarta. Y nada más. No hay ninguna otra
física de gravedad en todo el proyecto. La sombra, los arcos, el anillo de
fotones: nada de eso está programado en ningún lado. Son todas consecuencias de
esta línea.`,
    },

    // ───────────────────────────────────────────────────────────────────────
    //  5 · CÓMO SE INTEGRA — Verlet y paso adaptativo.
    // ───────────────────────────────────────────────────────────────────────
    {
        id: 'marcha',
        kicker: 'El integrador',
        title: 'Velocity-Verlet, y el paso se adapta',
        seconds: 26,
        cam: { u: 0.58, speed: 0.35 },
        panel: [
            {
                file: 'src/blackhole.js', lines: '314', lang: 'glsl',
                focus: [2, 3, 9, 10, 11],
                code: `// paso chico cerca (curvatura brutal), grande lejos (luz recta)
float dt = clamp(0.03 * r, 0.012, 2.5);
dt *= mix(0.30, 1.0, smoothstep(0.0, 0.40, abs(pos.y)));

// velocity-Verlet: casi el mismo precio que Euler,
// muchísima más precisión
vec3 prev = pos;
vec3 a0   = gravAccel(pos, h2);
vec3 next = pos + dir * dt + 0.5 * a0 * dt * dt;
vec3 a1   = gravAccel(next, h2);
dir += 0.5 * (a0 + a1) * dt;
pos  = next;`,
            },
        ],
        note: {
            title: 'Por qué Verlet y no Euler',
            text: 'Euler pierde energía en cada paso y las órbitas se le abren en espiral. Verlet es simpléctico: el error no se acumula en una sola dirección. Por eso el anillo queda fino.',
            at: 0.45,
        },
        say: `El fotón se integra con velocity-Verlet, no con Euler. Cuesta casi lo
mismo y es mucho más preciso: es lo que hace que el anillo de fotones salga como
una línea fina y no como un borrón. Y el paso es adaptativo. Chiquito cerca del
agujero negro, donde la curvatura es brutal, y grande lejos, donde la luz va casi
recta. Con eso trescientos pasos alcanzan y sobran.`,
    },

    // ───────────────────────────────────────────────────────────────────────
    //  6 · EL CLÍMAX — apagar la gravedad en vivo y volver a encenderla.
    //      La animación de uLensing está en `action`, abajo.
    // ───────────────────────────────────────────────────────────────────────
    {
        id: 'apagar',
        kicker: 'La demo',
        title: 'Apago la gravedad',
        seconds: 38,
        cam: { u: 0.31, speed: 0.15 },
        panel: [
            {
                file: 'src/blackhole.js', lines: '58', lang: 'js',
                focus: [2],
                live: (s) => `params.lensing =
  ${s.lensing.toFixed(3)}   // 0 = gravedad APAGADA (la luz viaja recta)`,
            },
            {
                file: 'src/blackhole.js', lines: '151', lang: 'glsl',
                focus: [3],
                code: `vec3 gravAccel(vec3 p, float h2){
  float r2 = max(dot(p, p), 1e-4);
  return -1.5 * uLensing * h2 * p / (r2 * r2 * sqrt(r2));
}`,
            },
        ],
        note: {
            title: 'Fijate en tres cosas',
            text: 'Los arcos de arriba y abajo (el disco de atrás). El anillo fino del borde. Y las estrellas: estiradas en arcos con gravedad, puntos redondos sin ella.',
            at: 0.12,
        },
        // p va de 0 a 1 a lo largo del beat.
        //   0 -.32  gravedad bajando de 1 a 0
        //  .32-.60  apagada: se ve el "render normal"
        //  .60-.85  volviendo a 1
        //  .85-1    encendida
        action: (ctx, p) => {
            const ease = (x) => x * x * (3 - 2 * x);           // smoothstep
            let v;
            if (p < 0.32) v = 1 - ease(p / 0.32);
            else if (p < 0.60) v = 0;
            else if (p < 0.85) v = ease((p - 0.60) / 0.25);
            else v = 1;
            ctx.setLensing(v);
        },
        say: `Ahora mirá lo que pasa si a ese multiplicador le voy bajando a cero.
La luz empieza a viajar cada vez más recta... y se van los arcos, se va el anillo
de fotones, las estrellas vuelven a ser puntitos redondos. Queda una esfera negra
y un disco plano: un render 3D comúnnn y silvestre. Y ahora al revés, lo vuelvo a
encender. Es exactamente el mismo código, con un número cambiado. Todo eso que
aparece no lo dibujó nadie: es la luz doblándose.`,
    },

    // ───────────────────────────────────────────────────────────────────────
    //  7 · EL DISCO — por qué un lado deslumbra.
    // ───────────────────────────────────────────────────────────────────────
    {
        id: 'doppler',
        kicker: 'Por qué un lado deslumbra',
        title: 'Doppler relativista y beaming',
        seconds: 32,
        cam: { u: 0.44, speed: 0.22 },
        panel: [
            {
                file: 'src/blackhole.js', lines: '192', lang: 'glsl',
                focus: [3, 12, 14, 15],
                code: `// órbita circular de Schwarzschild: v = sqrt(M / (r - 2M))
// en el ISCO (r = 6M) da exactamente 0.5c
float beta  = clamp(sqrt(1.0 / max(r - uRs, 0.35)), 0.0, 0.75);
float gamma = 1.0 / sqrt(1.0 - beta * beta);

// hacia el observador = -rayDir, o sea la trayectoria CURVA
// por la que el fotón realmente salió
float mu = dot(vdir, normalize(-rayDir));

float doppler = 1.0 / (gamma * (1.0 - beta * mu));
float gravity = sqrt(max(1.0 - uRs / r, 0.02));
float g = doppler * gravity;   // un solo número...

vec3  col    = blackbody(Temit * g);          // ...decide el color
float bright = emis * dens * pow(g, uBeaming); // ...y el brillo`,
            },
        ],
        note: {
            title: 'Al cubo, no al cuadrado',
            text: 'g³ es el beaming por banda de color: llega más energía por fotón, más fotones por segundo, y concentrados hacia adelante. Si midieras todo el espectro sería g⁴.',
            at: 0.48,
        },
        say: `El disco sigue la misma idea. El gas orbita a la velocidad real de una
órbita de Schwarzschild: en el borde interior, medio ce. De ahí sale un solo
número, ge, que junta el Doppler relativista con el corrimiento al rojo
gravitacional, o sea la energía que el fotón pierde para salir del pozo. Y ese
número decide dos cosas a la vez: el color, y el brillo elevado al cubo. Por eso
un lado del disco te encandila y el otro casi desaparece. No es un efecto que
puse a mano.`,
    },

    // ───────────────────────────────────────────────────────────────────────
    //  8 · EL COLOR — tampoco lo elegí yo.
    // ───────────────────────────────────────────────────────────────────────
    {
        id: 'color',
        kicker: 'El color',
        title: 'Es la temperatura del gas',
        seconds: 25,
        cam: { u: 0.66, speed: 0.28 },
        panel: [
            {
                file: 'src/blackhole.js', lines: '208', lang: 'glsl',
                focus: [2, 3],
                code: `// perfil de disco delgado (Shakura-Sunyaev): T ∝ r^(-3/4)
float Temit = uDiskTempInner * pow(uDiskInner / r, 0.75);
vec3  col   = blackbody(Temit * g);`,
            },
            {
                file: 'src/blackhole.js', lines: '121', lang: 'glsl',
                focus: [2],
                code: `// color de un cuerpo negro a T kelvin
vec3 blackbody(float T){
  float t = clamp(T, 1000.0, 40000.0) / 100.0;
  ...
}`,
            },
        ],
        note: {
            title: 'Shakura-Sunyaev, 1973',
            text: 'El mismo modelo de disco delgado que se usa en astrofísica de verdad. Y la curva de cuerpo negro es la de las lámparas: 2700 K cálida, 6500 K fría.',
            at: 0.42,
        },
        say: `Y el color tampoco lo elegí yo. El disco sigue el perfil de
Shakura-Sunyaev: la temperatura cae con erre a la menos tres cuartos. Y esos
kelvin se convierten a RGB con la curva de un cuerpo negro. O sea que el naranja
del borde de afuera es literalmente el naranja que tiene el gas a esa
temperatura. Lo mismo que le da color a una estrella.`,
    },

    // ───────────────────────────────────────────────────────────────────────
    //  9 · CIERRE — pantalla limpia otra vez, y fundido a negro.
    // ───────────────────────────────────────────────────────────────────────
    {
        id: 'cierre',
        kicker: '',
        title: '400 líneas, en el navegador',
        seconds: 20,
        cam: { u: 0.80, speed: 0.5 },
        say: `Cuatrocientas líneas de three.js corriendo en una pestaña del
navegador. El repo está en la descripción, con todos los comentarios explicando
parte por parte, y con las perillas para que lo toques: el color del disco, el
tamaño, hacia qué lado gira. Si te sirvió, suscribite. Nos vemos en el próximo.`,
    },
];

/** Duración total del video, en segundos. */
export const TOTAL_SECONDS = BEATS.reduce((a, b) => a + b.seconds, 0);
