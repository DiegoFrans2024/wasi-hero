import { easeInOut, mix, prog } from './math';

/** Duración total, en segundos: la historia (0–33) más el cierre de marca. */
export const END = 40.5;

export type Stage = {
  label: string;
  start: number;
  clock: string;
  headline: string;
  sub: string;
  color: string;
};

/** Todas las historias comparten estos tiempos: así reutilizan la línea de tiempo, las alertas y el cierre. */
export const STAGE_STARTS = [0, 6, 12, 20, 27, 33];

/** Etapa final de cada historia: el cierre de marca. */
export const OUTRO_STAGE: Stage = {
  label: 'Wasi', start: 33, clock: '', color: '#E11D2A',
  headline: 'Wasi detecta. Wasi alerta. Wasi protege. Wasi somos todos.',
  sub: 'Únete.',
};

/* ---------- Historia 1: Valentina vuelve a casa ---------- */

export const STAGES: Stage[] = [
  { label: 'Peligro', start: 0, clock: '19:42', color: '#FFFFFF',
    headline: 'Valentina, 12 años, vuelve sola a casa.',
    sub: 'Una camioneta se detiene a su lado.' },
  { label: 'Detección', start: 6, clock: '19:43:07', color: '#6CC4FF',
    headline: 'La IA de Wasi ve el arma y el susto.',
    sub: 'Una cámara IP, un celular reciclado y un dron lo detectan al mismo tiempo.' },
  { label: 'Alerta', start: 12, clock: '19:43:10', color: '#FF5A64',
    headline: 'En 3 segundos, la alerta llega a todos.',
    sub: 'A un vecino que dormía, a la policía y a sus papás.' },
  { label: 'Captura', start: 20, clock: '19:46', color: '#4F8DF7',
    headline: 'Todos llegan al mismo lugar.',
    sub: 'La policía detiene a los sospechosos. El video queda como evidencia.' },
  { label: 'A salvo', start: 27, clock: '19:47', color: '#22C55E',
    headline: 'Valentina está a salvo.',
    sub: 'Porque su comunidad estaba conectada. Nadie camina solo.' },
  OUTRO_STAGE,
];

const STARTS = STAGE_STARTS;

export function stageIndex(t: number) {
  'worklet';
  for (let i = STARTS.length - 1; i >= 0; i--) if (t >= STARTS[i]) return i;
  return 0;
}

export function stageEnd(i: number) {
  return i < STAGE_STARTS.length - 1 ? STAGE_STARTS[i + 1] : END;
}

/* ---------- Cierre de marca ---------- */

/** Cada golpe del cierre usa el color de su momento en la historia. */
export const BEATS = [
  { t: 33.7, verb: 'DETECTA', color: '#6CC4FF' },
  { t: 34.5, verb: 'ALERTA', color: '#FF5A64' },
  { t: 35.3, verb: 'PROTEGE', color: '#22C55E' },
];

export const OUTRO = {
  start: 33,
  allLit: 35.9,   // las tres líneas se encienden juntas
  collapse: 36.3, // se van para dar paso a la marca
  together: 36.7, // WASI · SOMOS TODOS
  join: 38.2,     // ÚNETE
  stores: 38.7,   // logos de las tiendas
};

/* ---------- Cortes a interiores (quién recibe la alerta) ---------- */

export type Cut = { start: number; end: number; title: string; a: string; b: string; swap: number; color: string };

/** Etiquetas de la IA, ancladas a puntos de la escena. */
export type Label = { text: string; x: number; y: number; a: number; b: number; kind: 'tag' | 'danger' | 'ok' };

export const LABELS: Label[] = [
  { text: 'Cámara IP', x: 830, y: 500, a: 6.6, b: 12.2, kind: 'tag' },
  { text: 'Celular reciclado', x: 1212, y: 555, a: 7.0, b: 12.2, kind: 'tag' },
  { text: 'Dron', x: 1110, y: 236, a: 9.0, b: 12.2, kind: 'tag' },
  { text: 'Arma detectada · 94%', x: 1236, y: 778, a: 7.7, b: 22.8, kind: 'danger' },
  { text: 'Susto detectado · 96%', x: 956, y: 626, a: 9.8, b: 12.15, kind: 'danger' },
  { text: 'Alerta enviada', x: 956, y: 626, a: 12.15, b: 20, kind: 'danger' },
  { text: 'A salvo', x: 1030, y: 626, a: 28.2, b: END + 5, kind: 'ok' },
];

export const CUTS: Cut[] = [
  { start: 13.2, end: 15.0, title: 'Vecino del 4B', a: 'Dormido. Su celular vibra.', b: 'Se levanta y baja a la calle', swap: 1.0, color: '#FFD27A' },
  { start: 15.0, end: 16.6, title: 'Policía', a: 'Aviso de arma, con video y ubicación', b: 'Unidad 12 en camino', swap: 0.8, color: '#6EA8FF' },
  { start: 16.6, end: 18.2, title: 'Papás de Valentina', a: '“Valentina está en peligro”', b: 'Salen corriendo del trabajo', swap: 0.8, color: '#FF8A92' },
];

/** Los rótulos de los cortes se acumulan en una lista que queda en pantalla hasta este segundo, para que se alcancen a leer. */
export const ALERT_LIST_END = 20;

const CUT_T = CUTS.map((c) => [c.start, c.end]);
const CUT_EDGES = [13.2, 15.0, 16.6, 18.2];

/** Opacidad del interior i. Entre interiores el corte es seco, como en cine. */
export function cutOpacity(t: number, i: number) {
  'worklet';
  const a = CUT_T[i][0];
  const b = CUT_T[i][1];
  if (t < a || t > b) return 0;
  const fadeIn = i === 0 ? Math.min(1, (t - a) / 0.15) : 1;
  const fadeOut = i === CUT_T.length - 1 ? Math.min(1, (b - t) / 0.15) : 1;
  return Math.min(fadeIn, fadeOut);
}

export function streetVisible(t: number) {
  'worklet';
  const s = cutOpacity(t, 0) + cutOpacity(t, 1) + cutOpacity(t, 2);
  return s > 1 ? 0 : 1 - s;
}

/** Destello blanco breve en cada corte. */
export function cutFlash(t: number) {
  'worklet';
  let f = 0;
  for (let i = 0; i < CUT_EDGES.length; i++) {
    const d = Math.abs(t - CUT_EDGES[i]);
    if (d < 0.09) f = Math.max(f, 1 - d / 0.09);
  }
  return f;
}

/* ---------- Cámara de la calle ---------- */

/** [tiempo, x, y, zoom] en coordenadas de la escena (1600 × 1000). */
export const KF: number[][] = [
  [0, 820, 560, 1.0],
  [5.8, 1010, 650, 1.35],
  [6.5, 1150, 720, 1.6],
  [7.4, 1260, 795, 2.6],   // primer plano del arma
  [8.6, 1260, 795, 2.7],
  [9.0, 995, 680, 2.4],    // barrido a la cara de Valentina
  [10.2, 995, 680, 2.55],
  [11.6, 1060, 560, 1.15], // se abre para ver cámaras y dron
  [12.0, 1060, 600, 1.25],
  [13.2, 1000, 640, 1.55],
  [18.2, 1000, 600, 1.05],
  [20.0, 1040, 620, 1.15],
  [20.6, 900, 780, 1.3],
  [22.4, 1080, 790, 1.6],  // sigue a la patrulla
  [24.0, 1100, 760, 1.55],
  [26.5, 1040, 650, 1.3],
  [27.0, 1040, 650, 1.3],
  [31.5, 1000, 640, 2.0],  // acercamiento final a la familia
  [33.0, 1000, 640, 2.05],
];

export function camAt(t: number, kf: number[][]) {
  'worklet';
  let i = 0;
  while (i < kf.length - 2 && t > kf[i + 1][0]) i++;
  const a = kf[i];
  const b = kf[i + 1];
  const p = easeInOut(prog(t, a[0], b[0]));
  return { x: mix(a[1], b[1], p), y: mix(a[2], b[2], p), z: mix(a[3], b[3], p) };
}

/** Sacudón de cámara: al disparar la alerta y al frenar la patrulla. */
export function shakeAt(t: number) {
  'worklet';
  let amp = 0;
  if (t > 12 && t < 12.9) amp = 11 * (1 - prog(t, 12, 12.9));
  if (t > 22.3 && t < 22.8) amp = 7 * (1 - prog(t, 22.3, 22.8));
  return { x: Math.sin(t * 93) * amp, y: Math.cos(t * 71) * amp * 0.7 };
}

/* ---------- Vibración del teléfono ---------- */

export type HapticKind = 'heavy' | 'warning' | 'success' | 'light';
export const HAPTICS: { t: number; kind: HapticKind }[] = [
  { t: 7.6, kind: 'heavy' },    // arma detectada
  { t: 9.7, kind: 'heavy' },    // susto detectado
  { t: 12.0, kind: 'warning' }, // alerta
  { t: 12.45, kind: 'warning' },
  { t: 12.9, kind: 'warning' },
  { t: 13.5, kind: 'light' },   // vibra el celular del vecino
  { t: 13.75, kind: 'light' },
  { t: 22.4, kind: 'heavy' },   // frena la patrulla
  { t: 27.9, kind: 'success' }, // a salvo
  { t: 33.7, kind: 'heavy' },   // Wasi detecta
  { t: 34.5, kind: 'heavy' },   // Wasi alerta
  { t: 35.3, kind: 'heavy' },   // Wasi protege
  { t: 36.7, kind: 'success' }, // Wasi somos todos
  { t: 38.2, kind: 'light' },   // únete
];
