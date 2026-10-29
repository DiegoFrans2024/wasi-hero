import { rng } from '../math';

/**
 * Geometría fija de la ruta del bus, generada una sola vez.
 * Las fachadas están en su propio eje x: la escena las desplaza para que el bus parezca avanzar.
 */
const r = rng(29);

const rect = (x: number, y: number, w: number, h: number) =>
  `M${x.toFixed(1)} ${y.toFixed(1)}h${w.toFixed(1)}v${h.toFixed(1)}h${(-w).toFixed(1)}Z`;

/** Desde aquí empieza el sector peligroso (en el eje de las fachadas). */
export const DANGER_X = 1300;

const calm = ['', '', ''];
let calmWin = '';
let calmTrim = '';
const danger = ['', ''];
let dangerWin = '';
let broken = '';
let shutters = '';
let shutterLines = '';
const graffiti = ['', '', ''];
let wire = '';

for (let x = -900; x < 3800; ) {
  const w = 170 + r() * 150;
  const top = 250 + r() * 170;
  if (x + w < DANGER_X) {
    const k = Math.floor(r() * 3);
    calm[k] += rect(x, top, w, 720 - top);
    calmTrim += rect(x - 4, top - 10, w + 8, 12);
    for (let wy = top + 34; wy < 600; wy += 64) {
      for (let wx = x + 22; wx < x + w - 40; wx += 54) calmWin += rect(wx, wy, 28, 38);
    }
  } else {
    const k = Math.floor(r() * 2);
    danger[k] += rect(x, top, w, 720 - top);
    for (let wy = top + 34; wy < 560; wy += 64) {
      for (let wx = x + 22; wx < x + w - 40; wx += 54) {
        const v = r();
        if (v < 0.25) broken += `M${wx} ${wy}h28l-10 16l8 6l-12 16h-14Z`;
        else dangerWin += rect(wx, wy, 28, 38);
      }
    }
    // Cortina metálica en el primer piso
    shutters += rect(x + 16, 610, w - 32, 110);
    for (let ly = 618; ly < 720; ly += 9) shutterLines += `M${x + 16} ${ly}h${w - 32}`;
    // Grafitis
    for (let g = 0; g < 2; g++) {
      const gx = x + 20 + r() * (w - 90);
      const gy = 560 + r() * 40;
      graffiti[Math.floor(r() * 3)] +=
        `M${gx} ${gy}q${12 + r() * 10} ${-30 - r() * 10} ${24} 0t${24} 0t${24} 0` + `M${gx + 6} ${gy + 14}q14 -18 30 2t26 -4`;
    }
    // Alambre de púas en el techo
    wire += `M${x} ${top - 8}`;
    for (let wx = x; wx < x + w; wx += 14) wire += `L${wx + 7} ${top - 16}L${wx + 14} ${top - 8}`;
  }
  x += w + 8;
}

// Baldosas de la vereda (en el eje de la vereda, que se mueve a la velocidad del bus)
let tiles = '';
for (let x = -1200; x < 5200; x += 110) tiles += `M${x} 834L${x - 40} 1000`;
let curb = '';
for (let x = -1200; x < 5200; x += 220) curb += rect(x, 822, 200, 12);

export const busCity = {
  calm, calmWin, calmTrim, danger, dangerWin, broken, shutters, shutterLines, graffiti, wire, tiles, curb,
};

/** Postes de luz en la vereda, solo en la zona tranquila (eje de la vereda). */
export const BUS_LAMPS = [-260, 440, 1140];
