# Wasi Protect · Historia animada (React Native + Expo)

Recreación cinematográfica de 33 segundos: Valentina vuelve sola a casa, la IA de Wasi detecta **el arma y el susto**, la alerta llega a un vecino que dormía, a la policía y a sus papás, todos llegan y la policía detiene a los sospechosos. Cierra con la marca: **Wasi detecta · Wasi alerta · Wasi protege · Wasi somos todos · Únete**, con los logos de App Store y Google Play.

Funciona en **iOS, Android y web** con el mismo código.

## Requisitos

- Node.js 20 o superior
- En tu celular: la app **Expo Go** (App Store / Google Play)

## Instalar y correr

```bash
cd wasi-hero
npm install          # instala todo y prepara Skia para web
npx expo start       # abre el servidor de desarrollo
```

Luego:

- **Celular:** escanea el código QR con Expo Go (Android) o con la cámara (iPhone).
- **Web:** presiona `w` en la terminal.
- **Simuladores:** `i` para iOS (requiere Mac con Xcode) o `a` para Android.

Si alguna librería no carga en Expo Go, crea una *development build*:
`npx expo run:ios` o `npx expo run:android` (o en la nube con `npx eas-cli@latest build --profile development`).

## Qué la hace más real

- **Cámara de cine:** acercamientos al arma y al rostro de Valentina, barridos y sacudón al dispararse la alerta.
- **Cortes a interiores:** el vecino dormido que despierta, la patrulla que arranca con sirenas y los papás que salen corriendo.
- **Luz y clima:** lluvia, calle mojada con reflejos, halos en faros y postes, luces de sirena que tiñen la escena, viñeta y grano de película.
- **Vibración del teléfono** (iOS/Android) en el arma, el susto, la alerta, el frenazo de la patrulla y el final.
- Todo corre en el hilo de UI con **Reanimated 4** y se dibuja con **Skia** (GPU).

## Estructura

```
App.tsx                 Entrada iOS/Android
App.web.tsx             Entrada web (carga Skia/WebAssembly primero)
src/story/
  HeroStory.tsx         Pantalla: reloj de la historia, textos, línea de tiempo, vibración
  timeline.ts           Textos, tiempos, cámara y cortes  ← lo más fácil de editar
  StoryCanvas.tsx       Lienzo Skia + efectos de pantalla (lluvia, sirenas, viñeta)
  Street.tsx            La calle: personajes, vehículos, detección
  Interiors.tsx         Los tres cortes: vecino, policía, papás
  Figures.tsx           Personas (Valentina y adultos)
  Vehicles.tsx          Camioneta, patrulla y dron
  Hud.tsx               Etiquetas de la IA y rótulos de los cortes
  Outro.tsx             Cierre de marca: Wasi detecta/alerta/protege, Únete y tiendas
  city.ts / math.ts / theme.ts
```

## Personalizar

- **Textos:** `STAGES` y `CUTS` en `src/story/timeline.ts`.
- **Ritmo de la cámara:** la lista `KF` en el mismo archivo (`[segundo, x, y, zoom]`).
- **Cierre de marca:** `BEATS` (verbos y colores) y `OUTRO` (tiempos) en `src/story/timeline.ts`.
- **Botones finales:** `<HeroStory onJoin={...} onLearnMore={...} onAppStore={...} onGooglePlay={...} />`.
- **Colores y tipografías:** `src/story/theme.ts`.

## Revisar un momento exacto (web)

Abre la versión web con `?t=` y el segundo que quieras, por ejemplo `http://localhost:8081/?t=9.9`, o `?t=40.5` para ver el cierre completo. La escena queda congelada ahí.

## Comandos útiles

```bash
npm run typecheck    # revisa tipos
npm run build:web    # genera la versión web en dist/
npx expo-doctor      # diagnostica dependencias
```

> Los porcentajes que muestra la IA (94 %, 96 %) son ilustrativos. Ajústalos a los valores reales del producto.
