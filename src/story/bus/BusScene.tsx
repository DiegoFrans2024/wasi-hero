import React from 'react';
import {
  BlurMask, Circle, DashPathEffect, Group, Line, LinearGradient, Path, RadialGradient, Rect, RoundedRect, Skia, vec,
} from '@shopify/react-native-skia';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { city } from '../city';
import { easeInOut, easeOut, easeOutBack, easeOutQuint, mix, prog, win } from '../math';
import { Adult, type Look, type Mood } from '../Figures';
import { Motorcycle, PoliceCar } from '../Vehicles';
import { C } from '../theme';
import { BUS_LAMPS, busCity } from './busCity';
import { BUS, handAt, ROBBERS, scrollAt } from './busTimeline';

type Num = SharedValue<number>;

/* ---------- Geometría del bus (coordenadas de la escena) ---------- */

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;
const WINDOWS = Array.from({ length: 7 }, (_, i) => rect(286 + i * 120, 424, 106, 168)).join('');
const DOOR = rect(1132, 424, 90, 338);
const DRIVER = 'M1240 424H1308L1330 520V592H1240Z';
const GLASS = WINDOWS + DOOR + DRIVER;
const OUTER = 'M250 412Q250 380 282 380H1296Q1322 380 1330 404L1342 470V752Q1342 772 1322 772H270Q250 772 250 752Z';
const BODY = OUTER + GLASS;
const GLASS_CLIP = Skia.Path.MakeFromSVGString(GLASS)!;
const WHEELS = [420, 1010];

/** Esquinas de un recuadro de detección. */
function brackets(cx: number, cy: number, w: number, h: number, l = 14) {
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const x1 = cx + w / 2;
  const y1 = cy + h / 2;
  return `M${x0} ${y0 + l}V${y0}H${x0 + l}M${x1 - l} ${y0}H${x1}V${y0 + l}M${x1} ${y1 - l}V${y1}H${x1 - l}M${x0 + l} ${y1}H${x0}V${y1 - l}`;
}

const KNIFE = handAt(ROBBERS[0].x);
const GUN = handAt(ROBBERS[1].x);
const KNIFE_BOX = { x: KNIFE.x + 12, y: KNIFE.y + 6 };
const GUN_BOX = { x: GUN.x + 8, y: GUN.y + 4 };
const FIGHT = { x: 650, y: 535 };
const BUS_CAM = { x: 1100, y: 438 };
const STOP_POLE = 1395; // poste del paradero, en la escena cuando el bus está detenido
const STOP_S = 1786 + STOP_POLE; // mismo poste, en el eje de la vereda

/* ---------- Personas ---------- */

type Rider = { x: number; look: Look; hands?: boolean; cheer?: boolean; seed: number };

const RIDERS: Rider[] = [
  { x: 340, look: { body: '#7E5BA6', legs: '#2C2F45', skin: '#E2B08A', hair: 'long', hairColor: '#4A2E1C' }, hands: true, cheer: true, seed: 11 },
  { x: 460, look: { body: '#8A6E4B', legs: '#33497A', skin: '#C68E62', hair: 'none' }, hands: true, seed: 12 },
  { x: 580, look: { body: '#2B4C8C', legs: '#1A2238', skin: '#8D5B3C', hair: 'long', hairColor: '#1A120C', tie: true }, cheer: true, seed: 13 },
  { x: 830, look: { body: '#C96F2E', legs: '#2B3F5E', skin: '#B9825B', hair: 'cap' }, hands: true, cheer: true, seed: 14 },
  { x: 950, look: { body: '#2F8F7B', legs: '#26365A', skin: '#F0C9A6', hair: 'long', hairColor: '#3A2618' }, hands: true, seed: 15 },
];
const MATEO: Look = { body: '#1F3A6E', legs: '#1A2238', skin: '#D9A47C', hair: 'short', hairColor: '#2B1B14', tie: true };
const DRIVER_LOOK: Look = { body: '#4F6B8F', legs: '#26365A', skin: '#B9825B', hair: 'cap' };
const ROBBER_LOOKS: Look[] = [
  { body: '#3A3F4B', legs: '#15171C', skin: '#C68E62', hair: 'hood' },
  { body: '#2E3440', legs: '#15171C', skin: '#9A6A48', hair: 'cap' },
  { body: '#4A4F5C', legs: '#1A1D24', skin: '#D9A47C', hair: 'hood' },
];
const WAIT_S = [STOP_S + 60, STOP_S + 125, STOP_S + 190]; // asaltantes esperando en el paradero
const OFFICER: Look = { body: '#1E3A7A', legs: '#14213F', skin: '#B9825B', officer: true };
const OFFICER2: Look = { ...OFFICER, skin: '#E2B08A' };
const STERN: Mood = { focus: 1 };
const CAUGHT: Mood = { fear: 0.55, worry: 0.6 };

function Passenger({ clock, item, i }: { clock: Num; item: Rider; i: number }) {
  const x = useDerivedValue<number>(() => item.x);
  const fear = useDerivedValue(() => prog(clock.value, 7.5 + i * 0.06, 7.9 + i * 0.06) * (1 - prog(clock.value, 23, 23.6)));
  const joy = useDerivedValue(() => prog(clock.value, 27.5 + i * 0.08, 28.2 + i * 0.08));
  const worry = useDerivedValue(() => prog(clock.value, 23, 23.6) * (1 - joy.value));
  const up = useDerivedValue(() =>
    (item.hands ? 0.95 * prog(clock.value, 8.7, 9.0) * (1 - prog(clock.value, 22.8, 23.3)) : 0) +
    (item.cheer ? 0.9 * prog(clock.value, 28.4 + i * 0.1, 28.9 + i * 0.1) : 0),
  );
  return (
    <>
      <RoundedRect x={item.x - 42} y={546} width={18} height={70} r={6} color="#2E7DA6" />
      <Adult clock={clock} x={x} y={BUS.seat} look={item.look} armsUp={up} mood={{ fear, worry, joy }} seed={item.seed} />
    </>
  );
}

/** Mateo sentado: miedo y lágrimas durante el asalto; se baja del bus al final. */
function MateoInside({ clock }: { clock: Num }) {
  const x = useDerivedValue<number>(() => BUS.mateo);
  const fear = useDerivedValue(() => prog(clock.value, 7.5, 7.9) * (1 - prog(clock.value, 23, 23.6)));
  const worry = useDerivedValue(() => prog(clock.value, 4.4, 5.2) * (1 - fear.value));
  const tears = useDerivedValue(() => win(clock.value, 10.2, 23.4, 0.6));
  const op = useDerivedValue(() => 1 - prog(clock.value, 27.0, 27.3));
  const flinch = useDerivedValue(() => prog(clock.value, 9.6, 9.9) * (1 - prog(clock.value, 22.8, 23.3)) * 0.35);
  return (
    <>
      <RoundedRect x={BUS.mateo - 42} y={546} width={18} height={70} r={6} color="#2E7DA6" />
      <Adult clock={clock} x={x} y={BUS.seat} look={MATEO} scale={0.95} armsUp={flinch} opacity={op} mood={{ fear, worry, tears }} seed={10} />
    </>
  );
}

function Driver({ clock }: { clock: Num }) {
  const x = useDerivedValue<number>(() => 1278);
  const fear = useDerivedValue(() => prog(clock.value, 7.4, 7.8) * (1 - prog(clock.value, 23, 23.6)));
  const joy = useDerivedValue(() => prog(clock.value, 27.6, 28.3));
  return <Adult clock={clock} x={x} y={BUS.seat} look={DRIVER_LOOK} mood={{ fear, joy, focus: 0.3 }} seed={16} />;
}

/** Asaltante esperando en el paradero; sube al bus cuando se detiene. */
function RobberOut({ clock, i }: { clock: Num; i: number }) {
  const d = i * 0.15;
  const x = useDerivedValue(() => {
    const t = clock.value;
    return mix(WAIT_S[i] - scrollAt(t), BUS.door + 30 + i * 12, easeInOut(prog(t, 5.8 + d, 6.5 + d)));
  });
  const walk = useDerivedValue<number>(() => (clock.value > 5.8 + d && clock.value < 6.5 + d ? 1 : 0));
  const op = useDerivedValue(() => 1 - prog(clock.value, 6.25 + d, 6.55 + d));
  return <Adult clock={clock} x={x} y={930} scale={1.1} look={ROBBER_LOOKS[i]} walk={walk} opacity={op} mood={STERN} seed={20 + i} />;
}

/** Asaltante dentro del bus: amenaza, y al final sale con las manos arriba. */
function RobberIn({ clock, i }: { clock: Num; i: number }) {
  const r = ROBBERS[i];
  const d = i * 0.18;
  const x = useDerivedValue(() => {
    const t = clock.value;
    if (t < 22.6) return mix(BUS.door, r.x, easeOut(prog(t, 6.5 + d, 7.3 + d)));
    return mix(r.x, BUS.door, easeInOut(prog(t, 22.6, 23.1)));
  });
  const op = useDerivedValue(() => prog(clock.value, 6.4 + d, 6.6 + d) * (1 - prog(clock.value, 22.95, 23.2)));
  const walk = useDerivedValue<number>(() => {
    const t = clock.value;
    return (t > 6.5 + d && t < 7.3 + d) || (t > 22.6 && t < 23.1) ? 1 : 0;
  });
  const point = useDerivedValue(() => {
    const t = clock.value;
    const end = 1 - prog(t, 22.3, 22.6);
    if (i === 0) return prog(t, 7.3, 7.6) * end;
    if (i === 1) return prog(t, 8.4, 8.7) * end;
    return prog(t, 9.4, 9.7) * (0.6 + 0.25 * Math.sin(t * 14)) * end; // jalones a Mateo
  });
  const up = useDerivedValue(() => prog(clock.value, 22.4, 22.7));
  const focus = useDerivedValue(() => 1 - up.value);
  const fear = useDerivedValue(() => up.value * 0.55);
  return (
    <Adult
      clock={clock} x={x} y={BUS.floor} look={ROBBER_LOOKS[i]} walk={walk} armsUp={up} point={point}
      holding={r.holding} opacity={op} mood={{ focus, fear }} seed={30 + i}
    />
  );
}

function Stand({ clock, x, look, mood, armsUp, seed, at }: { clock: Num; x: number; look: Look; mood: Mood; armsUp?: boolean; seed: number; at: number }) {
  const xv = useDerivedValue<number>(() => x);
  const up = useDerivedValue<number>(() => (armsUp ? 1 : 0));
  const op = useDerivedValue(() => prog(clock.value, at, at + 0.5));
  return <Adult clock={clock} x={xv} y={975} scale={1.1} look={look} armsUp={up} mood={mood} seed={seed} opacity={op} />;
}

/** Papá y mamá de Mateo: llegan corriendo y se alivian al verlo. */
function Parent({ clock, x0, x1, d, look, seed }: { clock: Num; x0: number; x1: number; d: number; look: Look; seed: number }) {
  const p = useDerivedValue(() => prog(clock.value, 24.0 + d, 26.8 + d));
  const x = useDerivedValue(() => mix(x0, x1, easeOut(p.value)));
  const walk = useDerivedValue<number>(() => (p.value > 0 && p.value < 0.97 ? 1 : 0));
  const joy = useDerivedValue(() => prog(clock.value, 27.8, 28.5));
  const fear = useDerivedValue(() => (1 - prog(clock.value, 26.5, 27.5)) * (1 - joy.value));
  const worry = useDerivedValue(() => 1 - joy.value);
  const reach = useDerivedValue(() => 0.14 * prog(clock.value, 28.0, 28.6));
  return <Adult clock={clock} x={x} y={975} scale={1.1} look={look} walk={walk} armsUp={reach} mood={{ fear, worry, joy }} seed={seed} />;
}

function MateoOutside({ clock }: { clock: Num }) {
  const x = useDerivedValue(() => mix(BUS.door, 1000, easeOut(prog(clock.value, 27.35, 28.3))));
  const op = useDerivedValue(() => prog(clock.value, 27.25, 27.45));
  const walk = useDerivedValue<number>(() => (clock.value > 27.35 && clock.value < 28.2 ? 1 : 0));
  const joy = useDerivedValue(() => prog(clock.value, 27.6, 28.3));
  return <Adult clock={clock} x={x} y={975} look={MATEO} walk={walk} opacity={op} mood={{ joy }} seed={10} />;
}

/* ---------- Escena del bus (coordenadas 1600 × 1000) ---------- */
export function BusScene({ clock }: { clock: Num }) {
  const t = clock;

  // Avance: el fondo se mueve más lento que la vereda (paralaje)
  const scroll = useDerivedValue(() => scrollAt(t.value));
  const farTr = useDerivedValue<Transforms3d>(() => [{ translateX: -scroll.value * 0.2 }]);
  const facadeTr = useDerivedValue<Transforms3d>(() => [{ translateX: -scroll.value * 0.55 }]);
  const walkTr = useDerivedValue<Transforms3d>(() => [{ translateX: -scroll.value }]);
  const gloom = useDerivedValue(() => 0.28 * prog(t.value, 3.2, 5.4));
  const busTr = useDerivedValue<Transforms3d>(() => [{ translateY: t.value < 5.6 ? Math.sin(t.value * 13) * 1.6 : 0 }]);
  const shine = useDerivedValue<Transforms3d>(() => [{ translateX: -scroll.value * 0.35 }]);

  // Puerta: se abre en el paradero y otra vez cuando llega la policía
  const doorOpen = useDerivedValue(() => Math.max(win(t.value, 5.7, 7.4, 0.4), prog(t.value, 22.4, 22.8)));
  const doorL = useDerivedValue<Transforms3d>(() => [{ scaleX: 1 - 0.82 * doorOpen.value }]);
  const doorR = useDerivedValue<Transforms3d>(() => [{ scaleX: 1 - 0.82 * doorOpen.value }]);
  const recBlink = useDerivedValue<number>(() => (t.value > 6 && t.value < 13 && Math.floor(t.value * 2) % 2 === 0 ? 1 : 0));

  // Detección
  const knifeEnd = useDerivedValue(() => prog(t.value, 7.6, 8.0));
  const gunEnd = useDerivedValue(() => prog(t.value, 8.7, 9.1));
  const fightEnd = useDerivedValue(() => prog(t.value, 9.8, 10.2));
  const weaponOp = useDerivedValue(() => 1 - prog(t.value, 22.4, 22.8));
  const boxColor = useDerivedValue(() => (Math.floor(t.value * 3) % 2 === 0 ? '#FF4D57' : '#FFD0D3'));
  const fightColor = useDerivedValue(() => (t.value > 27.6 ? C.signal : C.sos));
  const fightOp = useDerivedValue(() => 1 - prog(t.value, 22.8, 23.2));
  const rayBus = useDerivedValue(() => win(t.value, 6.7, 12.2, 0.3));
  const rayStop = useDerivedValue(() => win(t.value, 7.1, 12.2, 0.3));
  const dash = useDerivedValue(() => -t.value * 40);

  // Alerta
  const ringA = useDerivedValue(() => win(t.value, 12, 13.2, 0.2) + win(t.value, 18.2, 20, 0.2));
  const ring0 = useDerivedValue(() => 30 + 160 * (((t.value - 12) * 0.6) % 1));
  const ring1 = useDerivedValue(() => 30 + 160 * (((t.value - 12) * 0.6 + 1 / 3) % 1));
  const ring2 = useDerivedValue(() => 30 + 160 * (((t.value - 12) * 0.6 + 2 / 3) % 1));
  const ringOp0 = useDerivedValue(() => ringA.value * (1 - (((t.value - 12) * 0.6) % 1)));
  const ringOp1 = useDerivedValue(() => ringA.value * (1 - (((t.value - 12) * 0.6 + 1 / 3) % 1)));
  const ringOp2 = useDerivedValue(() => ringA.value * (1 - (((t.value - 12) * 0.6 + 2 / 3) % 1)));

  // Policía
  const motoA = useDerivedValue(() => mix(-320, 760, easeOutQuint(prog(t.value, 20.2, 21.9))));
  const motoB = useDerivedValue(() => mix(2100, 1740, easeOutQuint(prog(t.value, 20.5, 22.1))));
  const carX = useDerivedValue(() => mix(2500, 1730, easeOutQuint(prog(t.value, 20.4, 22.3))));

  // Final
  const badge = useDerivedValue<Transforms3d>(() => [
    { translateX: 1000 }, { translateY: 770 }, { scale: Math.max(0.001, easeOutBack(prog(t.value, 27.8, 28.3))) },
  ]);
  const badgeOp = useDerivedValue(() => prog(t.value, 27.8, 28.0));

  return (
    <Group>
      {/* Cielo de madrugada */}
      <Rect x={-1400} y={-1000} width={4400} height={1720}>
        <LinearGradient start={vec(0, -600)} end={vec(0, 720)} colors={['#1D2F63', '#4F68A6', '#C9A0A0', '#F2B07E']} positions={[0, 0.55, 0.85, 1]} />
      </Rect>
      <Circle cx={1380} cy={360} r={260}>
        <RadialGradient c={vec(1380, 360)} r={260} colors={['rgba(255,214,150,0.55)', 'rgba(255,214,150,0)']} />
      </Circle>
      <Circle cx={1380} cy={360} r={40} color="#FFE4B5" />

      {/* Ciudad lejana y fachadas frente a la calle */}
      <Group transform={farTr}>
        <Path path={city.far} color="rgba(60,78,128,0.55)" />
      </Group>
      <Group transform={facadeTr}>
        <Path path={busCity.calm[0]} color="#B97452" />
        <Path path={busCity.calm[1]} color="#C9A465" />
        <Path path={busCity.calm[2]} color="#6C9A90" />
        <Path path={busCity.calmTrim} color="rgba(241,230,210,0.45)" />
        <Path path={busCity.calmWin} color="#2E3D5C" />
        <Path path={busCity.danger[0]} color="#5A5E6B" />
        <Path path={busCity.danger[1]} color="#4A4D58" />
        <Path path={busCity.dangerWin} color="#1E2433" />
        <Path path={busCity.broken} color="#0D1018" />
        <Path path={busCity.shutters} color="#6F7682" />
        <Path path={busCity.shutterLines} style="stroke" strokeWidth={2} color="#545A66" />
        <Path path={busCity.graffiti[0]} style="stroke" strokeWidth={6} strokeCap="round" color="#E0457B" opacity={0.85} />
        <Path path={busCity.graffiti[1]} style="stroke" strokeWidth={6} strokeCap="round" color="#9BE15D" opacity={0.8} />
        <Path path={busCity.graffiti[2]} style="stroke" strokeWidth={6} strokeCap="round" color="#4FC3F7" opacity={0.8} />
        <Path path={busCity.wire} style="stroke" strokeWidth={2} color="#2A2D33" />
      </Group>
      <Rect x={-1400} y={-1000} width={4400} height={1720} color="#141828" opacity={gloom} />

      {/* Pista */}
      <Rect x={-1400} y={700} width={4400} height={122}>
        <LinearGradient start={vec(0, 700)} end={vec(0, 822)} colors={['#3A4256', '#2A3044']} />
      </Rect>

      {/* Bus: interior visto por las ventanas */}
      <Group transform={busTr}>
        <Rect x={250} y={380} width={1092} height={392}>
          <LinearGradient start={vec(0, 380)} end={vec(0, 772)} colors={['#4A5A80', '#2C3858']} />
        </Rect>
        <RoundedRect x={290} y={398} width={940} height={8} r={4} color="#FFF4D6" />
        <RoundedRect x={290} y={392} width={940} height={20} r={10} color="rgba(255,244,214,0.35)">
          <BlurMask blur={12} style="normal" />
        </RoundedRect>
        <Path path="M260 452H1230" style="stroke" strokeWidth={4} color="#B9C4D8" />
        {[350, 470, 590, 710, 830, 950].map((sx) => (
          <Path key={sx} path={`M${sx} 452V470a8 8 0 1 0 0.1 0`} style="stroke" strokeWidth={3} color="#D5DCE8" />
        ))}
        {/* Cámara del bus */}
        <Rect x={BUS_CAM.x - 3} y={406} width={6} height={20} color="#9AA6B8" />
        <Circle cx={BUS_CAM.x} cy={BUS_CAM.y} r={13} color="#E7ECF5" />
        <Circle cx={BUS_CAM.x} cy={BUS_CAM.y + 3} r={6} color="#0B1631" />
        <Circle cx={BUS_CAM.x + 9} cy={BUS_CAM.y - 6} r={2.5} color={C.sos} opacity={recBlink} />

        {RIDERS.map((p, i) => (
          <Passenger key={p.x} clock={t} item={p} i={i} />
        ))}
        <MateoInside clock={t} />
        <Driver clock={t} />
        {ROBBERS.map((_, i) => (
          <RobberIn key={i} clock={t} i={i} />
        ))}

        {/* Carrocería con ventanas */}
        <Path path={BODY} fillType="evenOdd">
          <LinearGradient start={vec(0, 380)} end={vec(0, 772)} colors={['#FFFFFF', '#E3E8F1']} />
        </Path>
        <Rect x={250} y={612} width={882} height={22} color="#1E4FA0" />
        <Rect x={1222} y={612} width={120} height={22} color="#1E4FA0" />
        <Rect x={250} y={712} width={882} height={60} color="#26324E" />
        <Rect x={1222} y={712} width={120} height={60} color="#26324E" />
        <Path path={GLASS} color="rgba(185,210,255,0.10)" />
        <Group clip={GLASS_CLIP}>
          <Group transform={shine}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
              <Path key={k} path={`M${200 + k * 420} 424l60 0l-120 340l-60 0Z`} color="rgba(255,255,255,0.10)" />
            ))}
          </Group>
        </Group>
        {/* Puerta plegable */}
        <Group origin={vec(1132, 600)} transform={doorL}>
          <Rect x={1132} y={424} width={45} height={338} color="rgba(180,205,240,0.25)" />
          <Rect x={1132} y={424} width={45} height={338} color="#C9D2E3" style="stroke" strokeWidth={4} />
        </Group>
        <Group origin={vec(1222, 600)} transform={doorR}>
          <Rect x={1177} y={424} width={45} height={338} color="rgba(180,205,240,0.25)" />
          <Rect x={1177} y={424} width={45} height={338} color="#C9D2E3" style="stroke" strokeWidth={4} />
        </Group>
        {/* Letrero de ruta, faros y ruedas */}
        <RoundedRect x={1150} y={386} width={150} height={20} r={4} color="#1A1D24" />
        <Path path="M1160 392h18M1184 392h10M1200 392h24M1160 400h40M1208 400h30M1246 392h40M1250 400h36" style="stroke" strokeWidth={3} color="#FFB547" />
        <RoundedRect x={1328} y={690} width={14} height={18} r={3} color="#FFE7A6" />
        <Circle cx={1340} cy={700} r={20} color="rgba(255,231,166,0.6)">
          <BlurMask blur={12} style="normal" />
        </Circle>
        {WHEELS.map((wx) => (
          <Group key={wx}>
            <Circle cx={wx} cy={776} r={54} color="#141A28" />
            <Circle cx={wx} cy={776} r={42} color="#0A0D14" />
            <Circle cx={wx} cy={776} r={18} color="#8A94A8" />
            <Circle cx={wx} cy={776} r={6} color="#2A3044" />
          </Group>
        ))}
      </Group>

      {/* Patrulla que cierra el paso */}
      <PoliceCar clock={t} x={carX} y={811} scale={1.5} flip />

      {/* Vereda */}
      <Rect x={-1400} y={822} width={4400} height={200}>
        <LinearGradient start={vec(0, 822)} end={vec(0, 1000)} colors={['#8A8F9C', '#5D6272']} />
      </Rect>
      <Group transform={walkTr}>
        <Path path={busCity.curb} color="#B9BFCB" />
        <Path path={busCity.tiles} style="stroke" strokeWidth={2} color="rgba(40,45,60,0.3)" />
        {BUS_LAMPS.map((lx) => (
          <Group key={lx}>
            <Rect x={lx - 6} y={300} width={12} height={660} color="#3A4256" />
            <RoundedRect x={lx - 30} y={292} width={60} height={12} r={6} color="#4A5470" />
          </Group>
        ))}
        {/* Paradero con cámara Wasi */}
        <Rect x={STOP_S - 4} y={560} width={8} height={400} color="#3A4256" />
        <RoundedRect x={STOP_S - 26} y={570} width={52} height={60} r={6} color="#1E4FA0" />
        <RoundedRect x={STOP_S - 14} y={584} width={28} height={20} r={4} color="#FFFFFF" />
        <Rect x={STOP_S - 10} y={608} width={20} height={4} color="#FFFFFF" />
        <RoundedRect x={STOP_S - 18} y={540} width={36} height={16} r={4} color="#E7ECF5" />
        <Circle cx={STOP_S - 18} cy={548} r={6} color="#0B1631" />
        <Circle cx={STOP_S + 12} cy={545} r={2.5} color={C.sos} opacity={recBlink} />
      </Group>
      {ROBBERS.map((_, i) => (
        <RobberOut key={i} clock={t} i={i} />
      ))}

      {/* Rayos de detección */}
      <Line p1={vec(BUS_CAM.x, BUS_CAM.y)} p2={vec(KNIFE_BOX.x, KNIFE_BOX.y)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayBus}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>
      <Line p1={vec(BUS_CAM.x, BUS_CAM.y)} p2={vec(GUN_BOX.x, GUN_BOX.y)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayBus}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>
      <Line p1={vec(BUS_CAM.x, BUS_CAM.y)} p2={vec(FIGHT.x, FIGHT.y)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayBus}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>
      <Line p1={vec(STOP_POLE - 18, 548)} p2={vec(KNIFE_BOX.x, KNIFE_BOX.y)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayStop}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>

      {/* Ondas de alerta */}
      <Circle cx={BUS.mateo} cy={545} r={ring0} color={C.sos} style="stroke" strokeWidth={3} opacity={ringOp0} />
      <Circle cx={BUS.mateo} cy={545} r={ring1} color={C.sos} style="stroke" strokeWidth={3} opacity={ringOp1} />
      <Circle cx={BUS.mateo} cy={545} r={ring2} color={C.sos} style="stroke" strokeWidth={3} opacity={ringOp2} />

      {/* Recuadros de la IA */}
      <Path path={brackets(KNIFE_BOX.x, KNIFE_BOX.y, 64, 46)} style="stroke" strokeWidth={3} strokeCap="round" color={boxColor} end={knifeEnd} opacity={weaponOp} />
      <Path path={brackets(GUN_BOX.x, GUN_BOX.y, 56, 46)} style="stroke" strokeWidth={3} strokeCap="round" color={boxColor} end={gunEnd} opacity={weaponOp} />
      <Path path={brackets(FIGHT.x, FIGHT.y, 170, 130, 20)} style="stroke" strokeWidth={3} strokeCap="round" color={fightColor} end={fightEnd} opacity={fightOp} />

      {/* Policía, captura y familia (en la vereda, delante del bus) */}
      <Motorcycle clock={t} x={motoA} y={965} scale={1.25} />
      <Motorcycle clock={t} x={motoB} y={975} scale={1.25} flip />
      <Parent clock={t} x0={-220} x1={880} d={0} seed={40}
        look={{ body: '#B4533C', legs: '#2C2F45', skin: '#D9A47C', hair: 'long', hairColor: '#2B1B14' }} />
      <Parent clock={t} x0={-300} x1={1110} d={0.3} seed={41}
        look={{ body: '#3F6E5A', legs: '#26365A', skin: '#C68E62', hair: 'short' }} />
      <MateoOutside clock={t} />
      <Stand clock={t} x={1250} look={OFFICER} mood={STERN} seed={42} at={23.1} />
      <Stand clock={t} x={1330} look={ROBBER_LOOKS[0]} mood={CAUGHT} armsUp seed={43} at={23.2} />
      <Stand clock={t} x={1410} look={ROBBER_LOOKS[1]} mood={CAUGHT} armsUp seed={44} at={23.3} />
      <Stand clock={t} x={1490} look={ROBBER_LOOKS[2]} mood={CAUGHT} armsUp seed={45} at={23.4} />
      <Stand clock={t} x={1580} look={OFFICER2} mood={STERN} seed={46} at={23.1} />

      {/* A salvo */}
      <Group transform={badge} opacity={badgeOp}>
        <Circle cx={0} cy={0} r={34} color="rgba(34,197,94,0.45)">
          <BlurMask blur={14} style="normal" />
        </Circle>
        <Circle cx={0} cy={0} r={26} color={C.signal} />
        <Path path="M-11 0L-3 8L12 -8" style="stroke" strokeWidth={5} strokeCap="round" strokeJoin="round" color="#fff" />
      </Group>
    </Group>
  );
}
