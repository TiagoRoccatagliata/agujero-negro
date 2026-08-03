# Agujero negro en three.js

Simulación de un agujero negro de Schwarzschild trazando geodésicas nulas: la
luz se curva de verdad, y de ahí salen solos el lente gravitacional, el anillo
de fotones y la asimetría Doppler del disco.

```bash
npm install
npm run dev       # abrí la URL que imprime
```

## Los archivos

| Archivo | Qué hay adentro |
|---|---|
| [src/main.js](src/main.js) | Arma la escena, el post-procesado y el bucle. Corto a propósito. |
| [src/blackhole.js](src/blackhole.js) | La física y el aspecto. **Acá está todo lo interesante.** |
| [src/camera-rig.js](src/camera-rig.js) | El recorrido de cámara para grabar. |
| [src/guion.js](src/guion.js) | El video largo: qué se dice, qué código se muestra y cuándo. |
| [src/shorts.js](src/shorts.js) | Los seis verticales para TikTok / Shorts. |
| [src/presentacion.js](src/presentacion.js) | El motor que reproduce los dos. |

## Teclas

| Tecla | Qué hace |
|---|---|
| `P` | **modo presentación: el video entero, solo** |
| `→` `←` | bloque siguiente / anterior |
| `T` | teleprompter (solo para ensayar) |
| `V` | modo shorts: recorta la pantalla a 9:16 |
| `C` | cámara cinematográfica ↔ mouse libre |
| `1`–`4` | saltar a un plano |
| `Espacio` | pausar |
| `R` | reiniciar el recorrido |
| `[` `]` | más lento / más rápido |
| `G` | **apagar / encender la gravedad** |
| `H` | ocultar el panel (para grabar) |

## Cómo funciona, en tres frases

No hay ningún objeto 3D en la escena. Hay **un rectángulo que tapa la pantalla**
cuyo material es un shader que corre una vez por píxel.

Para cada píxel se dispara un fotón **desde la cámara hacia afuera** y se lo
sigue paso a paso curvándolo con la gravedad. Al final se pregunta dónde
terminó: dentro del horizonte → negro; cruzó el plano del disco → gas
incandescente; se escapó → estrellas.

Toda la gravedad es **una sola línea**, la función `gravAccel` de
[src/blackhole.js](src/blackhole.js):

```glsl
a = -1.5 · h² · r̂ / r⁴      // geodésica nula de Schwarzschild
```

donde `h` es el momento angular del fotón, que se conserva.

## Lo que emerge solo (no está dibujado por nadie)

- **Los arcos de arriba y abajo de la sombra** son el disco visto *por detrás*
  del agujero negro, con la luz doblada hasta la cámara.
- **El anillo fino dentro de la sombra** es el anillo de fotones: luz que dio
  una vuelta o más antes de escapar.
- **Un lado del disco deslumbra y el otro casi desaparece.** El gas orbita a
  ~0.5c en el borde interior; el que viene hacia la cámara se ve mucho más
  brillante y azulado (beaming + Doppler), el que se aleja se apaga y enrojece.
- **Las estrellas se estiran en arcos** cerca del agujero negro. Apretá `G` y
  desaparecen: pasan a ser puntos redondos.

## Física que hay de verdad

Unidades geometrizadas, `G = c = M = 1`, así que el horizonte está en `Rs = 2`.

| Efecto | Cómo se calcula |
|---|---|
| Curvatura de la luz | geodésica nula exacta de Schwarzschild, integrada con velocity-Verlet |
| Borde interior del disco | 6M, el ISCO real de Schwarzschild |
| Velocidad orbital | `v = √(M/(r−2M))`, que da exactamente 0.5c en el ISCO |
| Temperatura del disco | perfil de Shakura-Sunyaev, `T ∝ r^(−3/4)` |
| Color del gas | color de cuerpo negro a esa temperatura — no elegido a mano |
| Doppler + redshift gravitacional | un solo factor `g`, que decide color **y** brillo |
| Brillo | `∝ g³` (beaming relativista) |

## Perillas para personalizar

Todo está en el objeto `params` arriba de [src/blackhole.js](src/blackhole.js).

| Querés… | Tocá |
|---|---|
| Color del disco | `diskTempInner`. 5200 = interior blanco y exterior naranja. 4000 = todo rojo. Más de 8000 se ve gris y lavado. |
| Disco más grande / chico | `diskOuter` (y `diskInner`, aunque 6.0 es el ISCO físico) |
| Más o menos brillo | `diskBrightness`. Muy alto satura todo a blanco y perdés el color. |
| Gas más turbulento o más liso | `diskTurbulence` (0 = anillo perfecto) |
| Invertir qué lado brilla | `spinDir` a `-1` |
| Asimetría Doppler más brutal | `beaming` a `4.0` (bolométrico real) |
| Fondo negro puro | `nebula` a `0` |
| Sombra más grande | `Rs`, pero ojo: cambia la escala de todo |
| Calidad vs. fluidez | `STEPS` arriba del archivo, y `RESOLUTION` en [src/main.js](src/main.js) |
| Halo / glow | los tres números del `UnrealBloomPass` en [src/main.js](src/main.js) |

## Cómo definir tus propios planos de cámara

En [src/camera-rig.js](src/camera-rig.js), el array `KEYFRAMES`. Cada entrada
dice dónde está la cámara en coordenadas esféricas alrededor del agujero negro:

```js
{ dist: 22, elev: 2.5, azim: 190, fov: 44 }
```

- `dist` distancia al centro (el horizonte está en 2)
- `elev` grados sobre el plano del disco — **0 = exactamente de canto**
- `azim` grados alrededor; tiene que ir siempre creciendo
- `fov` bajarlo = teleobjetivo, comprime y da drama

El tiempo se reparte en partes iguales entre keyframes: para que un tramo vaya
más lento, agregale más keyframes. `LOOP_SECONDS` es la vuelta completa.

## Para el video

**El video está armado adentro de la página.** Apretá `P` y corre solo: los
planos, los títulos, el código que aparece a la derecha con la línea resaltada,
las notas al margen, los cortes entre planos, la gravedad apagándose en vivo, y
el fundido a negro del final. Dura 4:04. Grabás de una y no editás nada.

El guion completo, con los tiempos y lo que hay que decir en cada bloque, está
en **[GUION.md](GUION.md)** — abrilo en el celular mientras grabás.

**Y hay seis shorts verticales.** Apretá `V` (o abrí la página en una ventana
más alta que ancha) y todo se reacomoda a 9:16: el agujero negro arriba, el
código abajo y grande. Con `1`-`6` elegís cuál de los seis grabás, y `P`
arranca. Los guiones están en **[GUION-SHORTS.md](GUION-SHORTS.md)**.

**Grabar.** Chrome en pantalla completa (`⌃⌘F`), esperá que el panel de ayuda se
esconda solo, arrancá OBS a 1080p o 1440p / 60fps, y recién ahí apretá `P`. El
cursor se oculta solo. Si va a menos de 60fps, bajá `STEPS` antes que
`RESOLUTION`.

Si te apurás hablando, `→` pasa al bloque siguiente sin esperar.

**Planos que ya están armados** (teclas `1`–`4`):

1. **Revelación** — lejos y desde arriba, bajando. Se ve el anillo completo.
2. **De canto** — el mejor. El disco se aplasta a una línea y los arcos
   lensados dominan la pantalla.
3. **Acercamiento** — teleobjetivo hacia el borde de la sombra.
4. **Ascenso** — se abre y sube; cierra el bucle.

**La demo que explica la física.** Apretá `G` en cámara. Con la gravedad
apagada se ve un disco plano común y una esfera negra: nada de arcos, nada de
anillo de fotones, estrellas como puntos redondos. Encendela de nuevo y todo
aparece. Es la forma más clara de mostrar qué hace el lente gravitacional, y
son dos imágenes del mismo código con un solo número cambiado.
# agujero-negro
