import { CUTS, END, OUTRO_STAGE, type Cut, type Label, type Stage } from '../timeline';

/* ---------- Historia 2: Mateo va al colegio en bus ---------- */

export const BUS_STAGES: Stage[] = [
  { label: 'Trayecto', start: 0, clock: '06:48', color: '#FFFFFF',
    headline: 'Mateo, 15 años, va en bus a su colegio.',
    sub: 'La ruta cruza un sector peligroso.' },
  { label: 'Detección', start: 6, clock: '06:52:14', color: '#6CC4FF',
    headline: 'La IA de Wasi ve cuchillos, armas y agresión.',
    sub: 'La cámara del bus y la del paradero lo detectan al mismo tiempo.' },
  { label: 'Alerta', start: 12, clock: '06:52:17', color: '#FF5A64',
    headline: 'En 3 segundos, la alerta llega a todos.',
    sub: 'A los vecinos más cercanos, a la policía y a su familia.' },
  { label: 'Captura', start: 20, clock: '06:57', color: '#4F8DF7',
    headline: 'Motos y patrullas detienen el bus.',
    sub: 'La policía captura a los asaltantes. El video queda como evidencia.' },
  { label: 'A salvo', start: 27, clock: '06:58', color: '#22C55E',
    headline: 'Mateo y todos en el bus están a salvo.',
    sub: 'Porque su comunidad estaba conectada. Nadie viaja solo.' },
  OUTRO_STAGE,
];

/** Mismos tiempos que los cortes de la historia 1; cambian los textos. */
const TEXTS: Omit<Cut, 'start' | 'end' | 'swap'>[] = [
  { title: 'Tienda de la esquina', a: 'A 50 metros. Su celular vibra.', b: 'Avisa a los vecinos y sale', color: '#FFD27A' },
  { title: 'Policía motorizada', a: 'Aviso de cuchillo y arma, con video', b: 'Motos 3 y 7 en camino', color: '#6EA8FF' },
  { title: 'Familia de Mateo', a: '“Mateo está en peligro”', b: 'Salen corriendo hacia el bus', color: '#FF8A92' },
];
export const BUS_CUTS: Cut[] = CUTS.map((c, i) => ({ ...c, ...TEXTS[i] }));

/* ---------- Movimiento del bus ---------- */

const V0 = 380;

/** Cuánto avanzó el bus: rápido al inicio y frena en el paradero (segundo 5.6). */
export function scrollAt(t: number) {
  'worklet';
  if (t < 3.8) return V0 * t;
  const d = Math.min(t - 3.8, 1.8);
  return V0 * 3.8 + V0 * (d - (d * d) / 3.6);
}

/** Avance total cuando el bus queda detenido. */
export const STOP = 1786;

/** Posiciones dentro del bus (coordenadas de la escena). */
export const BUS = {
  floor: 650,  // pies de quienes van de pie
  seat: 700,   // pies (ocultos) de quienes van sentados
  door: 1180,  // centro de la puerta
  mateo: 700,
};

/** Asaltantes: dónde terminan dentro del bus y con qué amenazan. */
export const ROBBERS = [
  { x: 960, holding: 'knife' as const },  // la mano queda en la ventana de adelante
  { x: 780, holding: 'gun' as const },
  { x: 600, holding: undefined },         // jalonea a Mateo
];

/** Mano derecha estirada de alguien de pie en x (brazo apuntando). */
export const handAt = (x: number) => ({ x: x + 65, y: BUS.floor - 114 });

/* ---------- Cámara ---------- */

const KNIFE = handAt(ROBBERS[0].x);
const GUN = handAt(ROBBERS[1].x);

/** [tiempo, x, y, zoom] en coordenadas de la escena (1600 × 1000). */
export const BUS_KF: number[][] = [
  [0, 760, 580, 1.0],
  [4.5, 860, 600, 1.05],
  [5.8, 1150, 640, 1.35],  // llega al paradero
  [6.8, 1060, 560, 1.55],  // suben los asaltantes
  [7.4, KNIFE.x, KNIFE.y, 2.5], // primer plano del cuchillo
  [8.3, KNIFE.x, KNIFE.y, 2.55],
  [8.7, GUN.x, GUN.y, 2.45],    // el arma
  [9.4, GUN.x, GUN.y, 2.5],
  [9.8, 655, 545, 2.4],    // Mateo y la agresión
  [10.6, 655, 545, 2.5],
  [11.6, 780, 560, 1.15],  // se abre para ver todo el bus
  [12.0, 780, 580, 1.2],
  [13.2, 760, 600, 1.45],
  [18.2, 800, 620, 1.0],
  [20.0, 850, 660, 1.0],
  [21.0, 900, 720, 1.05],  // llegan las motos
  [22.4, 1220, 720, 1.3],  // patrulla y puerta
  [24.0, 1260, 760, 1.2],
  [26.5, 1060, 720, 1.15],
  [27.0, 1060, 720, 1.15],
  [31.5, 1010, 730, 1.7],  // Mateo con su familia
  [33.0, 1010, 730, 1.75],
];

export const BUS_LABELS: Label[] = [
  { text: 'Mateo', x: 676, y: 520, a: 0.8, b: 5.4, kind: 'tag' },
  { text: 'Cámara del bus', x: 1060, y: 470, a: 6.6, b: 12.2, kind: 'tag' },
  { text: 'Cámara del paradero', x: 1300, y: 532, a: 7.0, b: 12.2, kind: 'tag' },
  { text: 'Cuchillo detectado · 93%', x: KNIFE.x - 30, y: KNIFE.y - 16, a: 7.7, b: 22.8, kind: 'danger' },
  { text: 'Arma detectada · 95%', x: GUN.x - 30, y: GUN.y - 16, a: 8.7, b: 22.8, kind: 'danger' },
  { text: 'Agresión detectada · 91%', x: 580, y: 494, a: 9.9, b: 12.15, kind: 'danger' },
  { text: 'Alerta enviada', x: 580, y: 494, a: 12.15, b: 20, kind: 'danger' },
  { text: 'A salvo', x: 1045, y: 792, a: 28.2, b: END + 5, kind: 'ok' },
];
