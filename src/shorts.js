// ============================================================================
//  SHORTS  ·  seis verticales para TikTok / Reels / YouTube Shorts
// ============================================================================
//
//  Cada short es un video ENTERO Y AUTOCONTENIDO de 30-45 s, con la misma
//  estructura de beats que guion.js. Se reproducen con el mismo motor.
//
//  LAS REGLAS DEL FORMATO (por qué están escritos así)
//  ---------------------------------------------------
//  · Los primeros 2 segundos deciden todo. El primer beat NUNCA explica:
//    muestra la imagen más fuerte y tira la afirmación más rara que tengas.
//  · Nada de introducción. No hay "hola, bienvenidos": ya arrancaste.
//  · Un solo concepto por short. Si necesitás dos, son dos shorts.
//  · El código tiene que ser LEGIBLE en un teléfono: pocas líneas y cortas.
//    Por eso los snippets de acá son más recortados que los del video largo.
//  · El cierre remata, no resume. Y el último plano vuelve a ser hermoso.
//
//  El `title` de cada beat funciona como subtítulo: en vertical se queda
//  fijo arriba durante todo el bloque, no se desvanece.
// ============================================================================

export const SHORTS = [

    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'sin-3d',
        nombre: 'No hay ningún objeto 3D',
        beats: [
            {
                id: 'gancho',
                kicker: '',
                title: 'Acá no hay ni un solo objeto 3D',
                seconds: 7,
                cam: { u: 0.31, speed: 0.2 },
                say: `Este agujero negro no tiene ni un objeto 3D. Ni una malla,
ni un modelo, ni una textura.`,
            },
            {
                id: 'quad',
                kicker: 'Lo único que hay',
                title: 'Un rectángulo que tapa la pantalla',
                seconds: 13,
                cam: { u: 0.33, speed: 0.15 },
                panel: [{
                    file: 'src/blackhole.js', lines: '408', lang: 'js',
                    focus: [2],
                    code: `// dos triángulos, y nada más
new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2), material
);`,
                }],
                say: `Lo único que hay en la escena es un rectángulo que tapa la
pantalla. Dos triángulos.`,
            },
            {
                id: 'pixel',
                kicker: 'Y encima',
                title: 'Un programa que corre por cada píxel',
                seconds: 15,
                cam: { u: 0.36, speed: 0.15 },
                panel: [{
                    file: 'src/blackhole.js', lines: '292', lang: 'glsl',
                    focus: [3, 4, 5],
                    code: `// un fotón por píxel: ¿dónde termina?
for (int i = 0; i < STEPS; i++){
  if (rmin < uRs) break;     // -> negro
  if (cruzaElDisco) { }      // -> gas
  if (rn > 120.0) break;     // -> estrellas
}`,
                }],
                note: {
                    title: 'La cuenta',
                    text: '2 millones de píxeles × 300 pasos = 600 millones de fotones simulados. En cada frame. Sesenta veces por segundo.',
                    at: 0.35,
                },
                say: `Encima de ese rectángulo corre un programa, una vez por
píxel. Tira un fotón y lo sigue hasta ver dónde termina: adentro del agujero
negro, en el disco, o escapando al espacio.`,
            },
            {
                id: 'remate',
                kicker: '',
                title: 'Todo esto es un solo rectángulo',
                seconds: 9,
                cam: { u: 0.40, speed: 0.25 },
                say: `Todo lo que estás viendo son dos triángulos y una
ecuación. El repo está en mi perfil.`,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'una-linea',
        nombre: 'Toda la gravedad es una línea',
        beats: [
            {
                id: 'gancho',
                title: 'Toda la gravedad de esto es UNA línea',
                seconds: 7,
                cam: { u: 0.27, speed: 0.2 },
                say: `Toda la gravedad de este agujero negro es una sola línea
de código.`,
            },
            {
                id: 'linea',
                kicker: 'Geodésica nula de Schwarzschild',
                title: 'a = −3/2 · h² / r⁴',
                seconds: 16,
                cam: { u: 0.29, speed: 0.15 },
                panel: [{
                    file: 'src/blackhole.js', lines: '151', lang: 'glsl',
                    focus: [3],
                    code: `vec3 gravAccel(vec3 p, float h2){
  float r2 = dot(p, p);
  return -1.5 * h2 * p / (r2 * r2 * sqrt(r2));
}`,
                }],
                note: {
                    title: 'Qué es h',
                    text: 'El momento angular del fotón. Se calcula una vez al empezar el rayo y no cambia nunca: es una cantidad conservada. Por eso alcanza con esto.',
                    at: 0.30,
                },
                say: `Esta. Es la geodésica nula de Schwarzschild: cuánto se
curva un fotón cerca de una masa. Menos tres medios, por hache al cuadrado,
sobre erre a la cuarta.`,
            },
            {
                id: 'emerge',
                kicker: 'Nadie dibujó nada de esto',
                title: 'La sombra, los arcos, el anillo: salen solos',
                seconds: 14,
                cam: { u: 0.33, speed: 0.12 },
                note: {
                    title: 'El anillo fino',
                    text: 'Es luz que dio una vuelta entera alrededor del agujero negro antes de escaparse hacia la cámara. Nadie lo programó: es la misma ecuación, con fotones que pasaron más cerca.',
                    at: 0.25,
                },
                say: `Y de esa línea sale todo. La sombra, los arcos de arriba y
abajo, el anillo de fotones. No hay código que dibuje ninguna de esas cosas:
aparecen porque la luz se curva.`,
            },
            {
                id: 'remate',
                title: 'Cuatro líneas. Un agujero negro.',
                seconds: 8,
                cam: { u: 0.38, speed: 0.25 },
                say: `Cuatro líneas de código y tenés un agujero negro con
física real. Está en mi perfil.`,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'apago',
        nombre: 'Apago la gravedad',
        beats: [
            {
                id: 'gancho',
                title: 'Voy a apagarle la gravedad',
                seconds: 6,
                cam: { u: 0.31, speed: 0.15 },
                say: `Le voy a apagar la gravedad a un agujero negro. Mirá lo
que pasa.`,
            },
            {
                id: 'apagando',
                kicker: 'Bajando el multiplicador a cero',
                title: 'La luz empieza a viajar recta',
                seconds: 16,
                cam: { u: 0.31, speed: 0.10 },
                panel: [{
                    file: 'src/blackhole.js', lines: '153', lang: 'glsl',
                    focus: [1],
                    live: (s) => `return -1.5 * ${s.lensing.toFixed(2)} * h2 * p / (r2*r2*sqrt(r2));`,
                }],
                action: (ctx, p) => {
                    const ease = (x) => x * x * (3 - 2 * x);
                    ctx.setLensing(p < 0.75 ? 1 - ease(p / 0.75) : 0);
                },
                say: `Le bajo el multiplicador a cero… y la luz empieza a viajar
recta. Se van los arcos. Se va el anillo. Las estrellas vuelven a ser puntos.`,
            },
            {
                id: 'plano',
                kicker: 'Gravedad = 0',
                title: 'Una esfera negra y un disco plano',
                seconds: 9,
                cam: { u: 0.31, speed: 0.10 },
                action: (ctx) => ctx.setLensing(0),
                note: {
                    title: 'Esto es lo que verías',
                    text: 'sin relatividad general: una bola negra tapando un anillo. Así se dibujaban los agujeros negros antes de que alguien se tomara el trabajo de curvar la luz.',
                    at: 0.2,
                },
                say: `Queda esto: una esfera negra y un disco plano. Un render
3D común y silvestre.`,
            },
            {
                id: 'vuelve',
                kicker: 'Y la vuelvo a encender',
                title: 'Eso que aparece es la luz doblándose',
                seconds: 14,
                cam: { u: 0.32, speed: 0.12 },
                action: (ctx, p) => {
                    const ease = (x) => x * x * (3 - 2 * x);
                    ctx.setLensing(p < 0.5 ? ease(p / 0.5) : 1);
                },
                say: `Y ahora la vuelvo a encender. Mismo código, un número
cambiado. Todo eso que aparece de la nada es luz que estaba detrás del agujero
negro y la gravedad dobló hasta la cámara.`,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'doppler',
        nombre: 'Por qué un lado brilla más',
        beats: [
            {
                id: 'gancho',
                title: '¿Por qué un lado brilla y el otro no?',
                seconds: 7,
                cam: { u: 0.44, speed: 0.18 },
                say: `¿Por qué un lado de este disco te encandila y el otro casi
desaparece? No es una luz puesta a mano.`,
            },
            {
                id: 'velocidad',
                kicker: 'Primero: la velocidad',
                title: 'El gas va a la mitad de la velocidad de la luz',
                seconds: 13,
                cam: { u: 0.45, speed: 0.14 },
                panel: [{
                    file: 'src/blackhole.js', lines: '194', lang: 'glsl',
                    focus: [3],
                    code: `// órbita circular real de Schwarzschild:
//     v = sqrt(M / (r - 2M))
float beta = sqrt(1.0 / (r - uRs));
// en el borde interior da exactamente 0.5c`,
                }],
                note: {
                    title: 'Por qué se corta ahí',
                    text: 'El borde interior está en 6M: es el ISCO, la última órbita circular estable. Más adentro no hay órbitas posibles, el gas cae y listo.',
                    at: 0.35,
                },
                say: `El gas orbita a la velocidad real de una órbita de
Schwarzschild. En el borde interior del disco eso da medio ce: la mitad de la
velocidad de la luz.`,
            },
            {
                id: 'g',
                kicker: 'Y de ahí sale un solo número',
                title: 'g decide el color Y el brillo',
                seconds: 16,
                cam: { u: 0.47, speed: 0.12 },
                panel: [{
                    file: 'src/blackhole.js', lines: '204', lang: 'glsl',
                    focus: [5, 6],
                    code: `// un solo número decide el color Y el brillo
float doppler = 1.0/(gamma*(1.0 - beta*mu));
float g = doppler * sqrt(1.0 - uRs/r);

vec3  col    = blackbody(Temit * g);
float bright = emis * pow(g, 3.0);`,
                }],
                note: {
                    title: 'Al cubo',
                    text: 'El brillo va con g³ porque no solo llega más energía por fotón: llegan más fotones por segundo y concentrados hacia adelante. Se llama beaming relativista.',
                    at: 0.35,
                },
                say: `De ahí sale un solo número, ge, que junta el Doppler
relativista con la energía que el fotón pierde al salir del pozo gravitatorio.
Y ese número decide dos cosas a la vez: el color, y el brillo elevado al cubo.`,
            },
            {
                id: 'remate',
                title: 'El gas que viene hacia vos, deslumbra',
                seconds: 9,
                cam: { u: 0.49, speed: 0.2 },
                say: `El gas que viene hacia vos deslumbra, el que se aleja se
apaga. Física, no retoque.`,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'color',
        nombre: 'El color no lo elegí yo',
        beats: [
            {
                id: 'gancho',
                title: 'Este naranja no lo elegí yo',
                seconds: 7,
                cam: { u: 0.66, speed: 0.22 },
                say: `El naranja de este disco no lo elegí yo. No hay ni una
paleta de colores en todo el código.`,
            },
            {
                id: 'temp',
                kicker: 'Disco delgado · Shakura-Sunyaev',
                title: 'Primero la temperatura: T ∝ r^(−3/4)',
                seconds: 14,
                cam: { u: 0.68, speed: 0.16 },
                panel: [{
                    file: 'src/blackhole.js', lines: '210', lang: 'glsl',
                    focus: [2],
                    code: `// el gas se calienta por fricción al caer
float T = 5200.0 * pow(6.0 / r, 0.75);`,
                }],
                note: {
                    title: 'De dónde sale',
                    text: 'Es el modelo de disco delgado de Shakura y Sunyaev, de 1973. El gas se frena por fricción, se calienta, y la temperatura cae hacia afuera con r elevado a −3/4.',
                    at: 0.35,
                },
                say: `Lo que hay es una temperatura. El gas se calienta por
fricción al caer, y eso da un perfil que baja hacia afuera: erre a la menos
tres cuartos. Adentro, miles de grados más que afuera.`,
            },
            {
                id: 'blackbody',
                kicker: 'Después: kelvin a RGB',
                title: 'El color de un cuerpo negro a esa temperatura',
                seconds: 14,
                cam: { u: 0.71, speed: 0.16 },
                panel: [{
                    file: 'src/blackhole.js', lines: '122', lang: 'glsl',
                    focus: [2],
                    code: `// mismo cálculo que le da color a una estrella
vec3 col = blackbody(Temit);`,
                }],
                note: {
                    title: 'Lo mismo que tu lámpara',
                    text: 'Los "2700 K cálida" y "6500 K fría" de las lámparas LED son exactamente esta curva. El disco de adentro es blanco por la misma razón que el sol es blanco.',
                    at: 0.3,
                },
                say: `Y esa temperatura se convierte a RGB con la curva de un
cuerpo negro: el mismo cálculo que le da color a una estrella, o a una lámpara.`,
            },
            {
                id: 'remate',
                title: 'Es el color que tiene el gas a esa temperatura',
                seconds: 8,
                cam: { u: 0.74, speed: 0.25 },
                say: `Así que ese naranja no es una decisión artística. Es el
color que tiene el gas a esa temperatura.`,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'sombra',
        nombre: 'La sombra es más grande',
        beats: [
            {
                id: 'gancho',
                title: 'La sombra es mucho más grande que el agujero negro',
                seconds: 8,
                cam: { u: 0.16, speed: 0.16 },
                say: `Esta mancha negra es dos veces y media más grande que el
agujero negro que la produce.`,
            },
            {
                id: 'horizonte',
                kicker: 'El horizonte',
                title: 'El agujero negro mide 2M de radio',
                seconds: 13,
                cam: { u: 0.19, speed: 0.13 },
                panel: [{
                    file: 'src/blackhole.js', lines: '39', lang: 'js',
                    focus: [2],
                    code: `// radio del horizonte, en unidades de masa
Rs: 2.0,`,
                }],
                note: {
                    title: 'Unidades geometrizadas',
                    text: 'Con G = c = M = 1, el horizonte de un agujero negro de Schwarzschild queda siempre en r = 2. Es la frontera: adentro, ni la luz sale.',
                    at: 0.35,
                },
                say: `El horizonte, el punto de no retorno, está en radio dos.
Adentro de ahí no sale nada, ni la luz.`,
            },
            {
                id: 'sombra',
                kicker: 'Pero la sombra que ves',
                title: 'mide √27 ≈ 5,2 de radio',
                seconds: 16,
                cam: { u: 0.22, speed: 0.13 },
                note: {
                    title: 'Por qué',
                    text: 'Los fotones que pasan cerca no van derecho: la gravedad los curva hacia adentro. Muchos que parecían esquivarlo terminan cayendo igual. El agujero negro atrapa un disco mucho más ancho que él mismo.',
                    at: 0.22,
                },
                say: `Pero la sombra que ves mide raíz de veintisiete, más de
cinco. Y no es un efecto visual: los fotones que pasan cerca se curvan hacia
adentro y terminan cayendo, aunque venían apuntando a pasar de largo. El agujero
negro atrapa un blanco mucho más ancho que él mismo.`,
            },
            {
                id: 'remate',
                title: 'Por eso la primera foto de un agujero negro salió así',
                seconds: 10,
                cam: { u: 0.26, speed: 0.2 },
                note: {
                    title: 'M87, 2019',
                    text: 'La foto del Event Horizon Telescope es exactamente esto: no se fotografió el horizonte, se fotografió su sombra.',
                    at: 0.15,
                },
                say: `Y por eso la primera foto de un agujero negro, la de M87,
es una rosquilla naranja con un agujero enorme en el medio. No estamos viendo el
horizonte: estamos viendo su sombra.`,
            },
        ],
    },
];

/** Duración de cada short, en segundos. */
export const shortSeconds = (s) => s.beats.reduce((a, b) => a + b.seconds, 0);
