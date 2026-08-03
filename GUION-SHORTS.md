# Shorts · 6 verticales de ~45 s

Seis videos autocontenidos en 9:16, para TikTok, Reels y YouTube Shorts. Cada
uno se graba de una pasada y no se edita nada, igual que el largo.

| # | Short | Dura | Idea |
|---|---|---|---|
| 1 | No hay ningún objeto 3D | 44 s | Un rectángulo y un programa por píxel |
| 2 | Toda la gravedad es una línea | 45 s | `gravAccel` y lo que emerge de ella |
| 3 | Apago la gravedad | 45 s | La demo. **El más fuerte de los seis.** |
| 4 | Por qué un lado brilla más | 45 s | Doppler + beaming |
| 5 | El color no lo elegí yo | 43 s | Shakura-Sunyaev + cuerpo negro |
| 6 | La sombra es más grande | 47 s | √27 M, y la foto del EHT |

**Orden sugerido de publicación:** 3 → 1 → 2 → 6 → 4 → 5. El de la gravedad es
el más impactante sin saber nada, así que va primero. El 6 cierra con la foto
real de M87, que es lo que más comentarios genera.

---

## Cómo grabar

**Opción A · ventana vertical de verdad** (la mejor calidad)

1. Abrí `http://localhost:5173/?shorts` en una ventana de Chrome y hacela
   angosta a mano hasta que quede más alta que ancha. La app detecta sola que
   está en vertical y reacomoda todo.
2. En OBS: **Captura de ventana** → esa ventana. Salida 1080×1920, 60 fps.
3. En una pantalla Retina, una ventana de ~540×960 se captura a 1080×1920
   reales.

**Opción B · recorte 9:16** (sin tocar el tamaño de la ventana)

1. Chrome en pantalla completa, y apretá **`V`**. La pantalla se recorta a una
   franja 9:16 centrada y todo se reacomoda adentro.
2. En OBS: agregá la ventana y recortala a esa franja (`Alt` + arrastrar los
   bordes de la fuente). Se configura una vez y queda guardado.
3. El encuadre que ves en la franja es **exactamente** el que vas a grabar: el
   campo de visión de la cámara es el vertical, y la franja tiene la misma
   altura que la pantalla.

**Después, en los dos casos:**

- `1`–`6` elegís qué short vas a grabar (el panel te muestra cuál está elegido).
- Arrancás a grabar, y apretás **`P`**.
- Arranca con fundido desde negro, y termina con fundido a negro. Cortás con la
  pantalla negra y el archivo ya está listo para subir.
- `→` adelanta si hablás más rápido. `Esc` aborta.

> **Grabá los seis de un saque.** Elegís el 1, `P`, hablás, cortás. Elegís el 2,
> `P`, hablás, cortás. En veinte minutos tenés seis semanas de contenido.

---

## Los guiones

> Lo que está **en negrita** es lo que aparece escrito en pantalla, así que no
> hace falta que lo digas igual: podés apoyarte y seguir.

### 1 · No hay ningún objeto 3D (44 s)

**0:00 — «Acá no hay ni un solo objeto 3D»**
> Este agujero negro no tiene ni un objeto 3D. Ni una malla, ni un modelo, ni
> una textura.

**0:07 — «Un rectángulo que tapa la pantalla»**
> Lo único que hay en la escena es un rectángulo que tapa la pantalla. Dos
> triángulos.

**0:20 — «Un programa que corre por cada píxel»**
> Encima de ese rectángulo corre un programa, una vez por píxel. Tira un fotón y
> lo sigue hasta ver dónde termina: adentro del agujero negro, en el disco, o
> escapando al espacio.
>
> *(en pantalla: 2 millones de píxeles × 300 pasos = 600 millones de fotones por
> frame)*

**0:35 — «Todo esto es un solo rectángulo»**
> Todo lo que estás viendo son dos triángulos y una ecuación. El repo está en mi
> perfil.

---

### 2 · Toda la gravedad es una línea (45 s)

**0:00 — «Toda la gravedad de esto es UNA línea»**
> Toda la gravedad de este agujero negro es una sola línea de código.

**0:07 — «a = −3/2 · h² / r⁴»**
> Esta. Es la geodésica nula de Schwarzschild: cuánto se curva un fotón cerca de
> una masa. Menos tres medios, por hache al cuadrado, sobre erre a la cuarta.
>
> *(en pantalla: qué es h, y por qué se conserva)*

**0:23 — «La sombra, los arcos, el anillo: salen solos»**
> Y de esa línea sale todo. La sombra, los arcos de arriba y abajo, el anillo de
> fotones. No hay código que dibuje ninguna de esas cosas: aparecen porque la
> luz se curva.

**0:37 — «Cuatro líneas. Un agujero negro.»**
> Cuatro líneas de código y tenés un agujero negro con física real. Está en mi
> perfil.

---

### 3 · Apago la gravedad (45 s) — **el más fuerte**

**0:00 — «Voy a apagarle la gravedad»**
> Le voy a apagar la gravedad a un agujero negro. Mirá lo que pasa.

**0:06 — «La luz empieza a viajar recta»** *(el número baja solo en pantalla)*
> Le bajo el multiplicador a cero…
>
> *(callate y dejá que se vea)*
>
> …y la luz empieza a viajar recta. Se van los arcos. Se va el anillo. Las
> estrellas vuelven a ser puntos.

**0:22 — «Una esfera negra y un disco plano»**
> Queda esto: una esfera negra y un disco plano. Un render 3D común y silvestre.

**0:31 — «Eso que aparece es la luz doblándose»**
> Y ahora la vuelvo a encender. Mismo código, un número cambiado. Todo eso que
> aparece de la nada es luz que estaba detrás del agujero negro y la gravedad
> dobló hasta la cámara.

---

### 4 · Por qué un lado brilla más (45 s)

**0:00 — «¿Por qué un lado brilla y el otro no?»**
> ¿Por qué un lado de este disco te encandila y el otro casi desaparece? No es
> una luz puesta a mano.

**0:07 — «El gas va a la mitad de la velocidad de la luz»**
> El gas orbita a la velocidad real de una órbita de Schwarzschild. En el borde
> interior del disco eso da medio ce: la mitad de la velocidad de la luz.
>
> *(en pantalla: por qué el disco se corta ahí — el ISCO)*

**0:20 — «g decide el color Y el brillo»**
> De ahí sale un solo número, ge, que junta el Doppler relativista con la
> energía que el fotón pierde al salir del pozo gravitatorio. Y ese número
> decide dos cosas a la vez: el color, y el brillo elevado al cubo.

**0:36 — «El gas que viene hacia vos, deslumbra»**
> El gas que viene hacia vos deslumbra, el que se aleja se apaga. Física, no
> retoque.

---

### 5 · El color no lo elegí yo (43 s)

**0:00 — «Este naranja no lo elegí yo»**
> El naranja de este disco no lo elegí yo. No hay ni una paleta de colores en
> todo el código.

**0:07 — «Primero la temperatura: T ∝ r^(−3/4)»**
> Lo que hay es una temperatura. El gas se calienta por fricción al caer, y eso
> da un perfil que baja hacia afuera: erre a la menos tres cuartos. Adentro,
> miles de grados más que afuera.

**0:21 — «El color de un cuerpo negro a esa temperatura»**
> Y esa temperatura se convierte a RGB con la curva de un cuerpo negro: el mismo
> cálculo que le da color a una estrella, o a una lámpara.
>
> *(en pantalla: los 2700 K y 6500 K de las lámparas LED son esta misma curva)*

**0:35 — «Es el color que tiene el gas a esa temperatura»**
> Así que ese naranja no es una decisión artística. Es el color que tiene el gas
> a esa temperatura.

---

### 6 · La sombra es más grande (47 s)

**0:00 — «La sombra es mucho más grande que el agujero negro»**
> Esta mancha negra es dos veces y media más grande que el agujero negro que la
> produce.

**0:08 — «El agujero negro mide 2M de radio»**
> El horizonte, el punto de no retorno, está en radio dos. Adentro de ahí no
> sale nada, ni la luz.

**0:21 — «mide √27 ≈ 5,2 de radio»**
> Pero la sombra que ves mide raíz de veintisiete, más de cinco. Y no es un
> efecto visual: los fotones que pasan cerca se curvan hacia adentro y terminan
> cayendo, aunque venían apuntando a pasar de largo. El agujero negro atrapa un
> blanco mucho más ancho que él mismo.

**0:37 — «Por eso la primera foto de un agujero negro salió así»**
> Y por eso la primera foto de un agujero negro, la de M87, es una rosquilla
> naranja con un agujero enorme en el medio. No estamos viendo el horizonte:
> estamos viendo su sombra.

---

## Para la descripción / los comentarios

Textos cortos que sirven para el pie del posteo:

- «Agujero negro de Schwarzschild trazando geodésicas nulas. three.js + WebGL,
  400 líneas, corre en el navegador.»
- «Todo lo que ves sale de una ecuación de dos líneas. Nada está dibujado.»
- «El código está en el link del perfil, con los comentarios explicando parte
  por parte.»

Y si preguntan por qué el disco se ve “atrás y adelante a la vez”: es el mismo
disco visto por arriba **y** por abajo al mismo tiempo, porque la luz de la cara
de abajo se curva por encima del agujero negro y llega igual a la cámara.

---

## Cambiar o agregar shorts

Todo está en [src/shorts.js](src/shorts.js). Cada short es una lista de beats
con la misma forma que los del video largo: cuánto dura, dónde va la cámara, qué
código se muestra, qué línea se resalta, qué nota aparece y qué decís.

Las reglas del formato están comentadas arriba del archivo.
