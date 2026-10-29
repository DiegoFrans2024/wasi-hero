import { rng } from './math';

/**
 * Geometría fija de la ciudad, generada una sola vez.
 * Todo se exporta como cadenas SVG para dibujar cientos de ventanas en pocas capas.
 */
const r = rng(11);

const rect = (x: number, y: number, w: number, h: number) =>
  `M${x.toFixed(1)} ${y.toFixed(1)}h${w.toFixed(1)}v${h.toFixed(1)}h${(-w).toFixed(1)}Z`;

// Estrellas
const stars1: { x: number; y: number }[] = [];
const stars2: { x: number; y: number }[] = [];
for (let i = 0; i < 220; i++) {
  const p = { x: -700 + r() * 3000, y: -800 + r() * 1120 };
  (i % 2 ? stars1 : stars2).push(p);
}

// Horizonte lejano
let far = '';
for (let x = -900; x < 2600; ) {
  const w = 50 + r() * 110;
  const top = 230 + r() * 150;
  far += rect(x, top, w + 1, 700 - top);
  x += w;
}

// Edificios cercanos [x, ancho, altura del techo]
const B: number[][] = [
  [-760, 190, 360], [-560, 200, 330], [-350, 190, 380], [-150, 140, 420],
  [0, 170, 380], [176, 224, 300], [406, 150, 430], [562, 250, 340],
  [818, 170, 420], [994, 214, 360], [1214, 250, 300], [1470, 130, 390],
  [1610, 220, 320], [1840, 180, 400], [2030, 240, 350], [2280, 200, 380],
];
const hole = { x: 1286, y: 426, w: 92, h: 112 }; // ventana del celular reciclado

let near = '';
let roofs = '';
let winDark = '';
let winOn = '';
const winWake = ['', '', ''];
const wakeCenters: { x: number; y: number }[] = [];

for (const [bx, bw, bt] of B) {
  near += rect(bx, bt, bw, 700 - bt);
  roofs += rect(bx, bt, bw, 6);
  for (let wy = bt + 28; wy < 660; wy += 46) {
    for (let wx = bx + 18; wx < bx + bw - 30; wx += 34) {
      if (wx + 16 > hole.x && wx < hole.x + hole.w && wy + 24 > hole.y && wy < hole.y + hole.h) continue;
      const v = r();
      const d = rect(wx, wy, 16, 24);
      winDark += d;
      if (v < 0.14) winOn += d;
      else if (v < 0.72) {
        const g = Math.floor(r() * 3);
        winWake[g] += d;
        if (wx > 790 && wx < 1440) wakeCenters.push({ x: wx + 8, y: wy + 12 });
      }
    }
  }
}

// Red de vecinos: líneas desde Valentina hasta algunas ventanas que se encienden
let net = '';
wakeCenters
  .filter((_, i) => i % 3 === 0)
  .slice(0, 14)
  .forEach((p) => {
    net += `M995 680L${p.x} ${p.y}`;
  });

// Líneas del carril
let lanes = '';
for (let x = -1160; x < 2700; x += 160) lanes += rect(x, 838, 70, 4);

// Lluvia: posiciones normalizadas, se proyectan a la pantalla en cada cuadro
const rain: number[][] = [];
for (let i = 0; i < 150; i++) rain.push([r(), r(), 0.7 + r() * 0.6, 12 + r() * 16]);

export const city = { stars1, stars2, far, near, roofs, winDark, winOn, winWake, net, lanes, rain };
export const LAMPS = [361, 961, 1541];
