# Guion del video · 4:04

Abrilo en el celular o en una segunda pantalla y leelo mientras grabás. La
página maneja sola los planos, los títulos, el código, los cortes y los
fundidos: vos solo hablás.

---

## El motivo del video

**La promesa del título es una sola cosa: "no hay ningún objeto 3D en esta
escena".** Todo lo que se ve (la sombra, los arcos, el anillo de fotones, que un
lado del disco deslumbre) sale de seguir fotones con una ecuación de dos líneas.

El video hace tres movimientos:

1. **Gancho** — mostrar algo hermoso y decir que no está dibujado.
2. **Revelación** — enseñar la línea de la que sale todo. Cuanto más corta se
   ve la ecuación, más impacta.
3. **Prueba** — apagar la gravedad en vivo y que el espectador vea el mundo
   derrumbarse a un render 3D común. Ese es el momento del video: es la
   demostración de que la física está haciendo el trabajo, no el arte.

El cierre manda al repo. Todo lo demás (Doppler, cuerpo negro) es evidencia de
que el patrón se repite: **nada de lo que ves lo elegí yo, lo eligió la física.**

---

## Antes de apretar REC

1. `npm run dev` y abrí la URL en Chrome.
2. **Pantalla completa** con `⌃⌘F`. (No F11: en Mac dejá `⌃⌘F`.)
3. Esperá 10 segundos a que el panel de ayuda se esconda solo.
4. OBS: 1080p o 1440p, **60 fps**, capturá la ventana de Chrome.
5. Si te va a menos de 60 fps, bajá `STEPS` en `src/blackhole.js` (300 → 220)
   antes de tocar `RESOLUTION`.
6. Grabá el audio con el micrófono en la misma pista. No hace falta nada más.

**Sobre las notas naranjas.** En varios bloques aparece sola, abajo del código,
una nota con un dato al margen. Aparece **después** del código a propósito: la
idea es que el espectador la lea mientras vos seguís hablando de otra cosa. No
tenés que leerla. Si te quedaste corto de texto, leela y ganás diez segundos.

**Empezá a grabar, respirá, y recién ahí apretá `P`.** La presentación arranca
con un fundido desde negro de 1,4 s, así que el arranque queda limpio aunque
tardes un segundo en empezar a hablar. Al final se funde a negro sola y se
queda ahí: cortá la grabación con la pantalla en negro y el video ya está
terminado, sin editar nada.

### Teclas mientras grabás

| Tecla | Qué hace |
|---|---|
| `P` | arrancar (y salir) |
| `→` | pasar al siguiente bloque **sin esperar** |
| `←` | volver al bloque anterior |
| `Esc` | abortar |
| `T` | teleprompter en pantalla — **solo para ensayar**, sale en la grabación |

La barra naranja finita de abajo de todo es tu reloj: te dice cuánto llevás del
video. Se ve apenas y no molesta.

**Si te apurás, apretá `→`.** Cada bloque tiene un tiempo fijo, pero la flecha
manda. Es preferible cortar antes que quedarte callado mirando la pantalla.

---

## El guion

> Los tiempos son de referencia: si te vas de largo, la página avanza sola; si
> terminás antes, apretá `→`.

### 1 · 0:00 — Apertura *(pantalla limpia, plano de revelación)*

> Esto es un agujero negro de Schwarzschild. La luz de las estrellas se está
> curvando, hay un anillo de fotones pegado al borde de la sombra, y un lado del
> disco brilla muchísimo más que el otro.
>
> **Nada de eso está dibujado.** Y lo más raro de todo: en esta escena no hay ni
> un solo objeto 3D.

---

### 2 · 0:18 — El truco *(aparece el código: ShaderMaterial y el quad)*

> Lo único que hay en la escena es un rectángulo que tapa la pantalla, con un
> ShaderMaterial de three.js.
>
> Fijate en el vertex shader: no multiplica por ninguna matriz, ni mira la
> cámara. Escupe las coordenadas de pantalla directo.
>
> Así que todo lo que ves lo decide el fragment shader, que corre una vez por
> cada píxel. Dos millones de veces por frame.

*(En pantalla aparece sola la cuenta: 4 vértices contra 2 millones de píxeles,
120 millones de fotones por segundo. No hace falta que la leas.)*

---

### 3 · 0:44 — Qué hace ese programa *(el `main()` del shader)*

> Y lo que hace por cada píxel es esto: reconstruye el rayo que sale de la cámara
> por ese píxel, y dispara un fotón hacia afuera. Al revés de como viaja la luz
> en la realidad, pero da lo mismo.
>
> Después lo sigue paso a paso, y al final pregunta dónde terminó. Si cayó dentro
> del horizonte, negro: eso es la sombra. Si cruzó el plano del disco, gas
> incandescente. Si se escapó, estrellas.

*(En pantalla: por qué trazamos la luz al revés, del ojo hacia afuera.)*

---

### 4 · 1:10 — La línea *(el corazón del video: `gravAccel`)*

> Y acá está todo el agujero negro. Esta función.
>
> Es la geodésica nula de Schwarzschild: la aceleración de un fotón es menos tres
> medios, por su momento angular al cuadrado, sobre erre a la cuarta. Y nada más.
>
> No hay ninguna otra física de gravedad en todo el proyecto. La sombra, los
> arcos, el anillo de fotones: **nada de eso está programado en ningún lado.**
> Son todas consecuencias de esta línea.

*(En pantalla: el anillo de fotones y el r = 3M. Si querés, leelo en voz alta:
da para diez segundos más.)*

*(Tomate tu tiempo acá. Es el bloque más largo a propósito.)*

---

### 5 · 1:42 — El integrador *(Verlet y paso adaptativo)*

> El fotón se integra con velocity-Verlet, no con Euler. Cuesta casi lo mismo y
> es mucho más preciso: es lo que hace que el anillo de fotones salga como una
> línea fina y no como un borrón.
>
> Y el paso es adaptativo. Chiquito cerca del agujero negro, donde la curvatura
> es brutal, y grande lejos, donde la luz va casi recta. Con eso trescientos
> pasos alcanzan y sobran.

*(En pantalla: por qué Euler falla y Verlet no.)*

---

### 6 · 2:09 — **El momento del video** *(la gravedad baja a cero sola)*

> Ahora mirá lo que pasa si a ese multiplicador le voy bajando a cero.

*(Callate unos segundos. Dejá que se vea. El número baja en pantalla.)*

> La luz empieza a viajar cada vez más recta… y se van los arcos, se va el anillo
> de fotones, las estrellas vuelven a ser puntitos redondos.
>
> Queda una esfera negra y un disco plano. Un render 3D común y silvestre.

*(Pausa. A los ~23 s vuelve a encenderse sola.)*

> Y ahora al revés, lo vuelvo a encender. Es exactamente el mismo código, con un
> número cambiado. Todo eso que aparece no lo dibujó nadie: **es la luz
> doblándose.**

---

### 7 · 2:47 — Por qué un lado deslumbra *(el bloque del disco)*

> El disco sigue la misma idea. El gas orbita a la velocidad real de una órbita
> de Schwarzschild: en el borde interior, medio ce.
>
> De ahí sale un solo número, ge, que junta el Doppler relativista con el
> corrimiento al rojo gravitacional, o sea la energía que el fotón pierde para
> salir del pozo.
>
> Y ese número decide dos cosas a la vez: el color, y el brillo elevado al cubo.
> Por eso un lado del disco te encandila y el otro casi desaparece. **No es un
> efecto que puse a mano.**

*(En pantalla: por qué es al cubo y no al cuadrado.)*

---

### 8 · 3:19 — El color *(Shakura-Sunyaev y cuerpo negro)*

> Y el color tampoco lo elegí yo. El disco sigue el perfil de Shakura-Sunyaev: la
> temperatura cae con erre a la menos tres cuartos. Y esos kelvin se convierten a
> RGB con la curva de un cuerpo negro.
>
> O sea que el naranja del borde de afuera es literalmente el naranja que tiene
> el gas a esa temperatura. Lo mismo que le da color a una estrella.

*(En pantalla: Shakura-Sunyaev 1973, y los kelvin de las lámparas LED.)*

---

### 9 · 3:44 — Cierre *(pantalla limpia, se abre y sube)*

> Cuatrocientas líneas de three.js corriendo en una pestaña del navegador.
>
> El repo está en la descripción, con todos los comentarios explicando parte por
> parte, y con las perillas para que lo toques: el color del disco, el tamaño,
> hacia qué lado gira.
>
> Si te sirvió, suscribite. Nos vemos en el próximo.

*(Dejá de hablar y esperá: la pantalla se funde a negro sola en 2,2 s. Cortá
la grabación ahí.)*

---

## ¿Y los verticales?

Los seis shorts para TikTok y YouTube Shorts están en
**[GUION-SHORTS.md](GUION-SHORTS.md)**. Se graban igual: elegís uno con `1`-`6`
y apretás `P`.

## Si querés cambiar algo

Todo el contenido está en [src/guion.js](src/guion.js): los tiempos, los
snippets de código, qué línea se resalta, dónde va la cámara y qué decís. El
motor que lo reproduce está en [src/presentacion.js](src/presentacion.js).

Para ensayar sin grabar: apretá `P` y después `T`, y vas a ver el texto de cada
bloque en pantalla.
