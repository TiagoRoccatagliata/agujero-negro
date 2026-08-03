import * as THREE from 'three';

// ============================================================================
//  AGUJERO NEGRO DE SCHWARZSCHILD  ·  ray marcher de geodésicas nulas
// ============================================================================
//
//  IDEA CENTRAL (leé esto y el resto se entiende solo)
//  ---------------------------------------------------
//  No hay ningún objeto 3D. Hay UN rectángulo que tapa la pantalla, y su
//  material es este shader, que se ejecuta una vez por cada píxel.
//
//  Para cada píxel disparamos un fotón DESDE la cámara HACIA AFUERA y lo
//  seguimos paso a paso, curvándolo con la gravedad. Al final preguntamos
//  dónde terminó, y eso decide el color:
//
//     cayó dentro del horizonte  →  negro       (la sombra)
//     cruzó el plano del disco   →  gas al rojo (el disco de acreción)
//     se escapó al infinito      →  estrellas   (el fondo)
//
//  Los arcos que se ven ARRIBA y ABAJO de la sombra no están dibujados por
//  nadie: son luz del disco que estaba DETRÁS del agujero negro y la
//  gravedad la dobló hasta la cámara. Emergen solos de la ecuación.
//
//  UNIDADES: geometrizadas, G = c = M = 1.
//  Con masa M = 1 el radio del horizonte es Rs = 2M = 2. Todas las
//  distancias de abajo están en esas unidades ("6" significa 6M).
// ============================================================================

// Pasos del ray marcher. Más = lensing más nítido y anillo de fotones más
// definido, pero más caro. 300 corre fluido; 500 es calidad de render final.
// Si te va lento, bajá esto ANTES de bajar la resolución.
const STEPS = 300;

// ---------------------------------------------------------------------------
//  PARÁMETROS  ·  ESTAS SON LAS PERILLAS QUE TOCÁS PARA PERSONALIZAR
// ---------------------------------------------------------------------------
export const params = {
    // --- geometría ---
    Rs: 2.0,              // radio del horizonte (= 2M). Coherente con la física de abajo.
    diskInner: 6.0,       // borde interior del disco. 6M = ISCO real de Schwarzschild.
    diskOuter: 16.0,      // borde exterior del disco.

    // --- aspecto del gas ---
    // Temperatura (K) del borde interior: ESTA es la perilla del color.
    // El exterior sale más frío solo, por el perfil T ∝ r^(-3/4).
    //   5200 → interior blanco cálido, exterior naranja  (lo más vistoso)
    //   4000 → todo naranja-rojo, más dramático
    //   9500 → interior azulado, exterior blanco: se ve gris y lavado, evitalo
    diskTempInner: 5200,
    diskBrightness: 0.90, // brillo general. Muy alto satura todo a blanco y
                          // perdés el color del cuerpo negro.
    diskFalloff: 2.4,     // cuánto se apaga hacia afuera (2 = suave, 3 = físico estricto).
    diskOpacity: 0.80,    // opacidad por cruce. Bajalo para ver el disco a través de sí mismo.
    diskTurbulence: 1.0,  // 0 = anillo liso perfecto, 1 = gas turbulento.
    spinDir: 1.0,         // sentido de giro: 1 o -1. Invierte qué lado brilla.

    // --- relatividad ---
    lensing: 1.0,         // 0 = gravedad APAGADA (luz recta). Probá 0 → 1 en cámara.
    beaming: 3.0,         // exponente del beaming Doppler. 3 = por banda, 4 = bolométrico real.

    // --- fondo ---
    starBrightness: 1.0,
    nebula: 1.0,          // 0 = espacio negro puro, 1 = banda tipo Vía Láctea.
};

// ---------------------------------------------------------------------------
//  EL SHADER
// ---------------------------------------------------------------------------
const fragmentShader = /* glsl */`
precision highp float;

// GLSL exige que el límite de un bucle sea constante, así que inyectamos el
// valor de STEPS (arriba, en JavaScript) dentro del texto del shader.
const int STEPS = ${STEPS};

varying vec2 vUv;

// datos que le manda main.js en cada frame
uniform vec3  uCamPos;      // posición de la cámara
uniform mat4  uCamInvProj;  // matriz de proyección invertida
uniform mat4  uCamWorld;    // orientación de la cámara en el mundo
uniform float uTime;

uniform float uRs, uDiskInner, uDiskOuter;
uniform float uDiskTempInner, uDiskBrightness, uDiskFalloff;
uniform float uDiskOpacity, uDiskTurbulence, uSpinDir;
uniform float uLensing, uBeaming;
uniform float uStarBrightness, uNebula;

// ===========================================================================
//  1) UTILIDADES: ruido y color de cuerpo negro
// ===========================================================================

float hash3(vec3 p){
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// ruido de valor 3D suave
float noise3(vec3 x){
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i + vec3(0,0,0)), hash3(i + vec3(1,0,0)), f.x),
        mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
        mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}

// varias octavas de ruido = aspecto turbulento / fractal
float fbm3(vec3 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * noise3(p); p *= 2.02; a *= 0.5; }
  return v;
}

// Color de un cuerpo negro a T kelvin (aproximación de Tanner Helland).
// Gracias a esto el color del gas NO está elegido a mano: sale de su
// temperatura, igual que en una estrella real.
vec3 blackbody(float T){
  float t = clamp(T, 1000.0, 40000.0) / 100.0;
  float r, g, b;
  if (t <= 66.0) {
    r = 255.0;
    g = 99.4708025861 * log(max(t, 1e-3)) - 161.1195681661;
  } else {
    r = 329.698727446  * pow(max(t - 60.0, 1e-3), -0.1332047592);
    g = 288.1221695283 * pow(max(t - 60.0, 1e-3), -0.0755148492);
  }
  if (t >= 66.0)      b = 255.0;
  else if (t <= 19.0) b = 0.0;
  else                b = 138.5177312231 * log(max(t - 10.0, 1e-3)) - 305.0447927307;
  return clamp(vec3(r, g, b) / 255.0, 0.0, 1.0);
}

// ===========================================================================
//  2) LA FÍSICA: aceleración de un fotón (geodésica nula de Schwarzschild)
// ===========================================================================
//
//     a = -3/2 · h² · r̂ / r⁴
//
//  donde h es el momento angular del fotón, que se CONSERVA (se calcula una
//  sola vez al empezar el rayo y no cambia nunca).
//
//  Esta única línea es todo el agujero negro. Poné uLensing = 0 y la luz
//  viaja recta: desaparecen los arcos, el anillo de fotones y la distorsión
//  de las estrellas. Es la mejor demo posible para explicarlo en cámara.
// ---------------------------------------------------------------------------
vec3 gravAccel(vec3 p, float h2){
  float r2 = max(dot(p, p), 1e-4);
  return -1.5 * uLensing * h2 * p / (r2 * r2 * sqrt(r2));
}

// ===========================================================================
//  3) EL DISCO DE ACRECIÓN
// ===========================================================================
//  Toda la asimetría del disco (un lado deslumbrante y azulado, el otro
//  apagado y rojo) sale de UN solo número: g, el factor de corrimiento total.
//  g junta dos efectos reales:
//     · Doppler relativista  → el gas que viene hacia nosotros a ~0.5c
//     · redshift gravitacional → el fotón pierde energía al salir del pozo
//  Y g decide las dos cosas a la vez: el color (T_observada = g · T_emitida)
//  y el brillo (intensidad ∝ g^beaming). Física, no retoque artístico.
// ---------------------------------------------------------------------------
vec3 diskSample(vec3 hit, vec3 rayDir, float r, out float opac){
  float t = clamp((r - uDiskInner) / (uDiskOuter - uDiskInner), 0.0, 1.0);

  // --- rotación kepleriana diferencial: Ω ∝ r^(-3/2) ---
  // Rotamos el punto de muestreo hacia atrás en el tiempo. El interior gira
  // mucho más rápido que el exterior, y eso estira el gas en filamentos solo.
  float omega = uSpinDir * 1.6 * pow(r, -1.5);
  float ang = -uTime * omega;
  float cs = cos(ang), sn = sin(ang);
  vec2 p = vec2(hit.x * cs - hit.z * sn, hit.x * sn + hit.z * cs);

  float turb  = fbm3(vec3(p * 1.10, r * 0.35));
  float fil   = fbm3(vec3(p * 3.50, r * 0.90 + 11.0));
  // variación puramente radial: filamentos concéntricos, que es la estructura
  // que de hecho produce la rotación diferencial al estirar el gas
  float rings = noise3(vec3(r * 3.2, 3.3, 7.7));
  float dens  = mix(1.0,
                    (0.35 + 1.5 * turb * (0.6 + 0.7 * fil)) * (0.65 + 0.70 * rings),
                    uDiskTurbulence);

  // Borde interior nítido (el ISCO es un corte bastante abrupto de verdad) y
  // borde exterior desvanecido, para que el disco no termine en un filo.
  float edge = smoothstep(0.0, 0.02, t) * (1.0 - smoothstep(0.45, 1.0, t));

  // --- velocidad orbital real ---
  // Órbita circular de Schwarzschild: v = sqrt(M / (r - 2M)).
  // En el ISCO (r = 6M) da exactamente 0.5c. No es un número inventado.
  vec3  vdir  = normalize(cross(vec3(0.0, 1.0, 0.0), hit)) * uSpinDir;
  float beta  = clamp(sqrt(1.0 / max(r - uRs, 0.35)), 0.0, 0.75);
  float gamma = 1.0 / sqrt(1.0 - beta * beta);

  // Ojo con este detalle: la dirección hacia el observador es -rayDir, o sea
  // la trayectoria CURVA por la que el fotón realmente salió. Usar la línea
  // recta cámara-disco sería más fácil pero estaría mal.
  vec3  toObs = normalize(-rayDir);
  float mu    = dot(vdir, toObs);              // +1 se acerca, -1 se aleja

  float doppler = 1.0 / (gamma * (1.0 - beta * mu));
  float gravity = sqrt(max(1.0 - uRs / r, 0.02));
  float g = doppler * gravity;                 // corrimiento total

  // Perfil de temperatura de un disco delgado (Shakura-Sunyaev): T ∝ r^(-3/4).
  // Interior blanco-azulado, exterior naranja. Otra vez: no elegido a mano.
  float Temit = uDiskTempInner * pow(uDiskInner / r, 0.75);
  vec3  col   = blackbody(Temit * g);

  float emis   = pow(uDiskInner / r, uDiskFalloff);
  float bright = uDiskBrightness * emis * dens * edge * pow(g, uBeaming);

  opac = clamp(uDiskOpacity * edge * dens, 0.0, 0.97);
  return col * bright;
}

// ===========================================================================
//  4) EL FONDO DE ESTRELLAS
// ===========================================================================
//  Hay que dividir el cielo en celdas y sortear una estrella por celda. La
//  tentación es usar celdas cúbicas 3D, pero eso falla: donde la esfera de
//  direcciones corta el cubo en diagonal, la celda tiene una forma alargada
//  y la estrella sale como una rayita larga en vez de un punto.
//
//  Solución: proyectamos la dirección sobre la cara de un cubo (como un
//  cubemap) y trabajamos con una grilla 2D limpia. Además miramos las 9
//  celdas vecinas, así una estrella cerca del borde de su celda no se corta.
// ---------------------------------------------------------------------------

// dirección → (uv en [-1,1]², índice de cara 0..5)
void cubeChart(vec3 d, out vec2 uv, out float face){
  vec3 a = abs(d);
  if (a.x >= a.y && a.x >= a.z){ uv = d.yz / a.x; face = d.x > 0.0 ? 0.0 : 1.0; }
  else if (a.y >= a.z)         { uv = d.xz / a.y; face = d.y > 0.0 ? 2.0 : 3.0; }
  else                         { uv = d.xy / a.z; face = d.z > 0.0 ? 4.0 : 5.0; }
}

vec3 starLayer(vec3 d, float N, float thr, float amp){
  vec2 uv; float face;
  cubeChart(d, uv, face);

  vec2 p    = uv * N;
  vec2 base = floor(p);
  vec3 col  = vec3(0.0);

  for (int j = -1; j <= 1; j++){
    for (int i = -1; i <= 1; i++){
      vec2  cell = base + vec2(float(i), float(j));
      vec3  id   = vec3(cell, face * 77.0);

      float n = hash3(id);
      if (n < thr) continue;                    // esta celda no tiene estrella

      // posición al azar dentro de la celda (constantes distintas por eje,
      // si no las coordenadas quedan correlacionadas y se alinean en diagonal)
      vec2 off = vec2(hash3(id + vec3(11.3, 7.1, 3.7)),
                      hash3(id + vec3(3.9, 17.7, 23.1)));

      float ad   = length(p - (cell + off));
      float glow = exp(-ad * ad * 14.0);
      if (glow < 0.002) continue;

      float b = (n - thr) / (1.0 - thr);        // 0..1: qué tan brillante salió
      float T = mix(3000.0, 11500.0, hash3(id + vec3(41.2, 5.3, 13.9)));

      col += blackbody(T) * glow * amp * (0.10 + b * b * 2.4);
    }
  }
  return col;
}

vec3 starField(vec3 d){
  // dos capas: estrellas notorias + polvo fino de fondo
  vec3 col = starLayer(d,  90.0, 0.9850, 1.00)
           + starLayer(d, 200.0, 0.9960, 0.55);

  // Banda tenue tipo Vía Láctea. Importa más de lo que parece: sin ella el
  // fondo es negro liso y no se NOTA que la gravedad retuerce el cielo.
  // Tiene que quedar apenas visible; si se pasa, lava todo a gris.
  float band = exp(-pow(dot(d, normalize(vec3(0.35, 0.82, 0.45))) * 5.5, 2.0));
  col += vec3(0.014, 0.017, 0.032) * band * (0.3 + 1.2 * fbm3(d * 4.0)) * uNebula;

  return col * uStarBrightness;
}

// ===========================================================================
//  5) MAIN: un fotón por píxel
// ===========================================================================
void main(){
  // --- reconstruir el rayo que sale de la cámara por este píxel ---
  vec2 ndc  = vUv * 2.0 - 1.0;
  vec4 view = uCamInvProj * vec4(ndc, -1.0, 1.0);
  view /= view.w;
  vec3 dir = normalize((uCamWorld * vec4(view.xyz, 0.0)).xyz);
  vec3 pos = uCamPos;

  // momento angular del fotón: constante durante todo el viaje
  vec3  hv = cross(pos, dir);
  float h2 = dot(hv, hv);

  vec3  color    = vec3(0.0);
  float transmit = 1.0;      // cuánta luz de atrás todavía puede pasar
  bool  captured = false;

  for (int i = 0; i < STEPS; i++){
    float r = length(pos);

    // --- paso adaptativo ---
    // Pasos chicos cerca del agujero negro (donde la curvatura es brutal) y
    // grandes lejos (donde la luz va casi recta). Así el mismo presupuesto de
    // pasos rinde mucho más que un dt fijo.
    float dt = clamp(0.03 * r, 0.012, 2.5);
    // y afinamos todavía más al acercarnos al plano del disco, para que el
    // cruce se detecte con precisión y el disco no quede aserrado
    dt *= mix(0.30, 1.0, smoothstep(0.0, 0.40, abs(pos.y)));

    // --- integración velocity-Verlet ---
    // Mucho más precisa que Euler por casi el mismo precio. Es lo que hace
    // que el anillo de fotones salga fino en vez de borroso.
    vec3 prev = pos;
    vec3 a0   = gravAccel(pos, h2);
    vec3 next = pos + dir * dt + 0.5 * a0 * dt * dt;
    vec3 a1   = gravAccel(next, h2);
    dir += 0.5 * (a0 + a1) * dt;
    pos  = next;

    float rn = length(pos);

    // ¿cruzó el horizonte? → este píxel es negro.
    // No alcanza con mirar si el PUNTO final quedó adentro: con un paso
    // grande el rayo puede entrar y salir sin que ninguna muestra caiga
    // dentro, y el borde de la sombra sale dentado. Así que calculamos la
    // distancia mínima del segmento al centro. Es exacto y cuesta nada.
    vec3  seg  = pos - prev;
    float tc   = clamp(-dot(prev, seg) / max(dot(seg, seg), 1e-6), 0.0, 1.0);
    float rmin = length(prev + seg * tc);
    if (rmin < uRs){ captured = true; break; }

    // ¿cruzó el plano del disco (y = 0)?
    if (prev.y * pos.y < 0.0){
      float f   = prev.y / (prev.y - pos.y);   // interpolamos al cruce exacto
      vec3  hit = mix(prev, pos, f);
      float rd  = length(hit.xz);
      if (rd > uDiskInner && rd < uDiskOuter){
        float opac;
        vec3  emis = diskSample(hit, dir, rd, opac);
        // acumulación con transparencia: un mismo rayo puede cruzar el disco
        // VARIAS veces (por eso se ven las imágenes secundarias, los arcos)
        color    += emis * transmit;
        transmit *= (1.0 - opac);
        if (transmit < 0.01) break;
      }
    }

    // se fue al infinito
    if (rn > 120.0 && dot(pos, dir) > 0.0) break;
  }

  // el fondo solo se ve si el fotón NO fue capturado
  if (!captured) color += starField(normalize(dir)) * transmit;

  gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = /* glsl */`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);   // el quad ya está en coordenadas de pantalla
}
`;

// ---------------------------------------------------------------------------
//  Armado: una escena mínima con el quad a pantalla completa
// ---------------------------------------------------------------------------
export function createBlackHole() {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uCamPos: { value: new THREE.Vector3() },
            uCamInvProj: { value: new THREE.Matrix4() },
            uCamWorld: { value: new THREE.Matrix4() },
            uTime: { value: 0 },

            uRs: { value: params.Rs },
            uDiskInner: { value: params.diskInner },
            uDiskOuter: { value: params.diskOuter },
            uDiskTempInner: { value: params.diskTempInner },
            uDiskBrightness: { value: params.diskBrightness },
            uDiskFalloff: { value: params.diskFalloff },
            uDiskOpacity: { value: params.diskOpacity },
            uDiskTurbulence: { value: params.diskTurbulence },
            uSpinDir: { value: params.spinDir },
            uLensing: { value: params.lensing },
            uBeaming: { value: params.beaming },
            uStarBrightness: { value: params.starBrightness },
            uNebula: { value: params.nebula },
        },
        vertexShader,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;   // el vertex shader ignora la cámara

    const scene = new THREE.Scene();
    scene.add(quad);

    // cámara ortográfica de relleno: el shader no la usa, pero RenderPass la pide
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    return { scene, camera, material };
}

// Copia `params` a los uniforms. Llamalo si cambiás params en caliente.
export function syncParams(material) {
    const u = material.uniforms;
    u.uRs.value = params.Rs;
    u.uDiskInner.value = params.diskInner;
    u.uDiskOuter.value = params.diskOuter;
    u.uDiskTempInner.value = params.diskTempInner;
    u.uDiskBrightness.value = params.diskBrightness;
    u.uDiskFalloff.value = params.diskFalloff;
    u.uDiskOpacity.value = params.diskOpacity;
    u.uDiskTurbulence.value = params.diskTurbulence;
    u.uSpinDir.value = params.spinDir;
    u.uLensing.value = params.lensing;
    u.uBeaming.value = params.beaming;
    u.uStarBrightness.value = params.starBrightness;
    u.uNebula.value = params.nebula;
}
