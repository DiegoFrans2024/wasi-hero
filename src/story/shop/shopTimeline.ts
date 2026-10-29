import { CUTS, END, OUTRO_STAGE, type Cut, type Label, type Stage } from '../timeline';

/* ---------- Historia 3: Doña Rosa y su tienda de barrio ---------- */

export const SHOP_STAGES: Stage[] = [
  { label: 'Tienda', start: 0, clock: '18:20', color: '#FFFFFF',
    headline: 'Doña Rosa, 62 años, atiende su tienda de barrio.',
    sub: 'Dos motos se detienen frente a su puerta.' },
  { label: 'Detección', start: 6, clock: '18:21:05', color: '#6CC4FF',
    headline: 'La IA de Wasi ve las armas y la extorsión.',
    sub: 'La cámara de la tienda y el celular reciclado del vecino lo detectan al mismo tiempo.' },
  { label: 'Alerta', start: 12, clock: '18:21:08', color: '#FF5A64',
    headline: 'En 3 segundos, la alerta llega a todos.',
    sub: 'A los vecinos de la cuadra, a la policía y a su familia.' },
  { label: 'Captura', start: 20, clock: '18:25', color: '#4F8DF7',
    headline: 'Vecinos y policía llegan en minutos.',
    sub: 'Los extorsionadores son detenidos. El video queda como evidencia.' },
  { label: 'A salvo', start: 27, clock: '18:26', color: '#22C55E',
    headline: 'Doña Rosa está a salvo.',
    sub: 'Porque su barrio estaba conectado. Nadie está solo.' },
  OUTRO_STAGE,
];

/** Mismos tiempos que los cortes de la historia 1; cambian los textos. */
const TEXTS: Omit<Cut, 'start' | 'end' | 'swap'>[] = [
  { title: 'Vecino del taller', a: 'A 30 metros. Su celular vibra.', b: 'Llama a los vecinos y sale', color: '#FFD27A' },
  { title: 'Central de policía', a: 'Video en vivo: armas y amenaza', b: 'Patrulla 5 en camino', color: '#6EA8FF' },
  { title: 'Hija de Doña Rosa', a: '“Mamá está en peligro”', b: 'Sale corriendo a la tienda', color: '#FF8A92' },
];
export const SHOP_CUTS: Cut[] = CUTS.map((c, i) => ({ ...c, ...TEXTS[i] }));

/* ---------- Posiciones (coordenadas de la escena) ---------- */

export const SHOP = {
  street: 960,  // pies sobre la pista (motos)
  walk: 800,    // pies sobre la vereda, frente al mostrador
  counter: 760, // pies (ocultos) detrás del mostrador
  rosa: 875,
  door: 870,    // por donde sale Doña Rosa al final
};

/** Los dos motorizados: dónde estacionan, dónde amenazan y con qué. */
export const THUGS = [
  { moto: 470, x: 700, flip: false, holding: 'gun' as const },
  { moto: 260, x: 1045, flip: true, holding: 'knife' as const },
];

/** Mano derecha estirada de un motorizado (escala 1.1) parado en la vereda. */
export const thugHand = (i: number) => {
  const t = THUGS[i];
  const dx = 65 * 1.1;
  return { x: t.flip ? t.x - dx : t.x + dx, y: SHOP.walk - 114 * 1.1 };
};

/* ---------- Cámara ---------- */

const GUN = thugHand(0);
const KNIFE = thugHand(1);

/** [tiempo, x, y, zoom] en coordenadas de la escena (1600 × 1000). */
export const SHOP_KF: number[][] = [
  [0, 850, 610, 1.0],
  [3.6, 850, 630, 1.05],
  [4.6, 620, 780, 1.0],   // llegan las motos
  [5.8, 640, 790, 1.1],
  [6.6, 860, 690, 1.4],   // entran a la tienda
  [7.4, GUN.x, GUN.y, 2.4], // el arma
  [8.3, GUN.x, GUN.y, 2.45],
  [8.7, KNIFE.x, KNIFE.y, 2.4], // el cuchillo
  [9.4, KNIFE.x, KNIFE.y, 2.45],
  [9.8, SHOP.rosa, 640, 2.35], // Doña Rosa y la extorsión
  [10.6, SHOP.rosa, 640, 2.45],
  [11.6, 850, 650, 1.15],
  [12.0, 850, 650, 1.2],
  [13.2, 850, 650, 1.45],
  [18.2, 850, 660, 1.0],
  [20.0, 850, 700, 1.0],
  [21.0, 880, 740, 1.05], // llegan vecinos y patrulla
  [22.4, 1060, 780, 1.2],
  [24.0, 1060, 790, 1.15],
  [26.5, 800, 720, 1.15],
  [27.0, 800, 720, 1.15],
  [31.5, 690, 700, 1.75], // Doña Rosa con su hija
  [33.0, 690, 700, 1.8],
];

export const SHOP_LABELS: Label[] = [
  { text: 'Doña Rosa', x: 850, y: 590, a: 0.8, b: 4.8, kind: 'tag' },
  { text: 'Cámara de la tienda', x: 560, y: 486, a: 6.6, b: 12.2, kind: 'tag' },
  { text: 'Celular reciclado', x: 1290, y: 420, a: 7.0, b: 12.2, kind: 'tag' },
  { text: 'Arma detectada · 95%', x: GUN.x - 40, y: GUN.y - 18, a: 7.6, b: 22.8, kind: 'danger' },
  { text: 'Cuchillo detectado · 92%', x: KNIFE.x - 110, y: KNIFE.y - 18, a: 8.7, b: 22.8, kind: 'danger' },
  { text: 'Extorsión detectada · 90%', x: SHOP.rosa - 90, y: 572, a: 9.9, b: 12.15, kind: 'danger' },
  { text: 'Alerta enviada', x: SHOP.rosa - 50, y: 572, a: 12.15, b: 20, kind: 'danger' },
  { text: 'A salvo', x: 712, y: 590, a: 28.2, b: END + 5, kind: 'ok' },
];
