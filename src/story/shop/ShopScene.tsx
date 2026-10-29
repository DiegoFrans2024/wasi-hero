import React from 'react';
import {
  BlurMask, Circle, DashPathEffect, Group, Line, LinearGradient, Path, RadialGradient, Rect, RoundedRect, Text, useFont, vec,
} from '@shopify/react-native-skia';
import { Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { city } from '../city';
import { easeInOut, easeOut, easeOutBack, easeOutQuint, mix, prog, win } from '../math';
import { Adult, type Look, type Mood } from '../Figures';
import { Motorcycle, PoliceCar } from '../Vehicles';
import { C } from '../theme';
import { SHOP, THUGS, thugHand } from './shopTimeline';

type Num = SharedValue<number>;

/** Esquinas de un recuadro de detección. */
function brackets(cx: number, cy: number, w: number, h: number, l = 14) {
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const x1 = cx + w / 2;
  const y1 = cy + h / 2;
  return `M${x0} ${y0 + l}V${y0}H${x0 + l}M${x1 - l} ${y0}H${x1}V${y0 + l}M${x1} ${y1 - l}V${y1}H${x1 - l}M${x0 + l} ${y1}H${x0}V${y1 - l}`;
}

const GUN = thugHand(0);
const KNIFE = thugHand(1);
const GUN_BOX = { x: GUN.x + 10, y: GUN.y + 4 };
const KNIFE_BOX = { x: KNIFE.x - 14, y: KNIFE.y + 6 };
const THREAT = { x: SHOP.rosa, y: 642 };
const SHOP_CAM = { x: 614, y: 522 };
const PHONE_CAM = { x: 1335, y: 446 };

const PRODUCTS = ['#E0457B', '#FFB547', '#4FC3F7', '#9BE15D', '#F4F6FA', '#C96F2E', '#8E6BD8'];
const AWNING = Array.from({ length: 14 }, (_, i) => i);
const SIGN = 'TIENDA DOÑA ROSA';

/* ---------- Personas ---------- */

const ROSA: Look = { body: '#C2577A', legs: '#3A2F45', skin: '#C68E62', hair: 'bun', hairColor: '#B8B8C4', apron: true };
const DAUGHTER: Look = { body: '#7E5BA6', legs: '#2C2F45', skin: '#C68E62', hair: 'long', hairColor: '#2B1B14' };
const THUG_LOOKS: Look[] = [
  { body: '#3A3F4B', legs: '#15171C', skin: '#C68E62', hair: 'helmet', hairColor: '#14171E' },
  { body: '#4A2F2F', legs: '#15171C', skin: '#9A6A48', hair: 'helmet', hairColor: '#8C1C24' },
];
const OFFICER: Look = { body: '#1E3A7A', legs: '#14213F', skin: '#B9825B', officer: true };
const OFFICER2: Look = { ...OFFICER, skin: '#E2B08A' };
const STERN: Mood = { focus: 1 };
const CAUGHT: Mood = { fear: 0.55, worry: 0.6 };

type Arrival = { x0: number; x1: number; d: number; look: Look; cheer?: boolean };
const NEIGHBORS: Arrival[] = [
  { x0: -260, x1: 330, d: 0, look: { body: '#2F5D8C', legs: '#26365A', skin: '#B9825B', hair: 'cap' }, cheer: true }, // el del taller
  { x0: -340, x1: 425, d: 0.4, look: { body: '#9FC3E8', legs: '#45386A', skin: '#F0C9A6', hair: 'long', hairColor: '#5A3A22', stripes: true } },
  { x0: 1900, x1: 1310, d: 0.2, look: { body: '#B8901F', legs: '#2B3F5E', skin: '#8D5B3C', hair: 'short' }, cheer: true },
  { x0: 1980, x1: 1400, d: 0.6, look: { body: '#6B7FA8', legs: '#33497A', skin: '#C68E62', hair: 'none' } },
];

/** Clienta que compra al inicio y se va antes de que lleguen las motos. */
function Customer({ clock }: { clock: Num }) {
  const x = useDerivedValue(() => mix(760, 1750, easeInOut(prog(clock.value, 3.0, 5.2))));
  const walk = useDerivedValue<number>(() => (clock.value > 3.0 && clock.value < 5.2 ? 1 : 0));
  const joy = useDerivedValue(() => 0.7 * (1 - prog(clock.value, 3.0, 3.4)));
  return <Adult clock={clock} x={x} y={SHOP.walk} scale={1.05} walk={walk} mood={{ joy }} seed={60}
    look={{ body: '#2F8F7B', legs: '#26365A', skin: '#F0C9A6', hair: 'long', hairColor: '#3A2618' }} />;
}

/** Doña Rosa detrás del mostrador: atiende, se asusta, levanta las manos y al final sale. */
function RosaInside({ clock }: { clock: Num }) {
  const x = useDerivedValue<number>(() => SHOP.rosa);
  const fear = useDerivedValue(() => prog(clock.value, 7.2, 7.6) * (1 - prog(clock.value, 23, 23.6)));
  const worry = useDerivedValue(() => Math.max(prog(clock.value, 4.8, 5.6), prog(clock.value, 23, 23.6)) * (1 - fear.value));
  const joy = useDerivedValue(() => 0.6 * (1 - prog(clock.value, 3.2, 3.8)));
  const tears = useDerivedValue(() => win(clock.value, 10.2, 23.4, 0.6));
  const up = useDerivedValue(() => 0.95 * prog(clock.value, 7.4, 7.7) * (1 - prog(clock.value, 22.8, 23.3)));
  const op = useDerivedValue(() => 1 - prog(clock.value, 27.0, 27.3));
  return <Adult clock={clock} x={x} y={SHOP.counter} look={ROSA} armsUp={up} opacity={op} mood={{ fear, worry, joy, tears }} seed={61} />;
}

function RosaOutside({ clock }: { clock: Num }) {
  const x = useDerivedValue(() => mix(SHOP.door, 700, easeOut(prog(clock.value, 27.35, 28.3))));
  const op = useDerivedValue(() => prog(clock.value, 27.25, 27.45));
  const walk = useDerivedValue<number>(() => (clock.value > 27.35 && clock.value < 28.2 ? 1 : 0));
  const joy = useDerivedValue(() => prog(clock.value, 27.6, 28.3));
  const tears = useDerivedValue(() => 0.6 * win(clock.value, 27.6, 33.5, 0.4)); // llora de alivio
  return <Adult clock={clock} x={x} y={SHOP.walk} look={ROSA} walk={walk} opacity={op} mood={{ joy, tears }} seed={61} />;
}

/** Motorizado: baja de la moto, entra a la tienda, amenaza y al final sale con las manos arriba. */
function Thug({ clock, i }: { clock: Num; i: number }) {
  const t0 = THUGS[i];
  const d = i * 0.2;
  const p = useDerivedValue(() => easeInOut(prog(clock.value, 6.0 + d, 6.9 + d)));
  const x = useDerivedValue(() => mix(t0.moto + 6, t0.x, p.value));
  const y = useDerivedValue(() => mix(SHOP.street, SHOP.walk, p.value));
  const op = useDerivedValue(() => prog(clock.value, 5.8 + d, 6.0 + d) * (1 - prog(clock.value, 22.9, 23.2)));
  const walk = useDerivedValue<number>(() => {
    const t = clock.value;
    return (t > 6.0 + d && t < 6.9 + d) || (t > 22.6 && t < 23.1) ? 1 : 0;
  });
  const point = useDerivedValue(() => {
    const t = clock.value;
    const end = 1 - prog(t, 22.3, 22.6);
    if (i === 0) return prog(t, 7.2, 7.5) * end;
    // Golpea el mostrador con la nota de extorsión y luego amenaza con el cuchillo
    return Math.max(prog(t, 8.4, 8.7) * end, win(t, 9.55, 9.9, 0.1) * 0.5);
  });
  const up = useDerivedValue(() => prog(clock.value, 22.4, 22.7));
  const focus = useDerivedValue(() => 1 - up.value);
  const fear = useDerivedValue(() => up.value * 0.55);
  return (
    <Adult
      clock={clock} x={x} y={y} scale={1.1} flip={t0.flip} look={THUG_LOOKS[i]} walk={walk} armsUp={up} point={point}
      holding={t0.holding} opacity={op} mood={{ focus, fear }} seed={62 + i}
    />
  );
}

function Neighbor({ clock, item, seed }: { clock: Num; item: Arrival; seed: number }) {
  const p = useDerivedValue(() => prog(clock.value, 20.3 + item.d, 23.0 + item.d));
  const x = useDerivedValue(() => mix(item.x0, item.x1, easeOut(p.value)));
  const walk = useDerivedValue<number>(() => (p.value > 0 && p.value < 0.97 ? 1 : 0));
  const glow = useDerivedValue(() => 0.6 + 0.4 * Math.sin(clock.value * 3 + item.d * 5));
  const joy = useDerivedValue(() => prog(clock.value, 27.6 + item.d * 0.3, 28.4 + item.d * 0.3));
  const worry = useDerivedValue(() => 1 - joy.value);
  const up = useDerivedValue(() => (item.cheer ? 0.9 * prog(clock.value, 28.4 + item.d * 0.2, 28.9 + item.d * 0.2) : 0));
  return <Adult clock={clock} x={x} y={SHOP.walk} look={item.look} walk={walk} phone={glow} armsUp={up} mood={{ worry, joy }} seed={seed} />;
}

function Daughter({ clock }: { clock: Num }) {
  const p = useDerivedValue(() => prog(clock.value, 24.0, 26.8));
  const x = useDerivedValue(() => mix(-250, 610, easeOut(p.value)));
  const walk = useDerivedValue<number>(() => (p.value > 0 && p.value < 0.97 ? 1 : 0));
  const joy = useDerivedValue(() => prog(clock.value, 27.8, 28.5));
  const fear = useDerivedValue(() => (1 - prog(clock.value, 26.5, 27.5)) * (1 - joy.value));
  const worry = useDerivedValue(() => 1 - joy.value);
  const reach = useDerivedValue(() => 0.14 * prog(clock.value, 28.0, 28.6));
  return <Adult clock={clock} x={x} y={SHOP.walk} look={DAUGHTER} walk={walk} armsUp={reach} mood={{ fear, worry, joy }} seed={66} />;
}

function Stand({ clock, x, look, mood, armsUp, seed, at }: { clock: Num; x: number; look: Look; mood: Mood; armsUp?: boolean; seed: number; at: number }) {
  const xv = useDerivedValue<number>(() => x);
  const up = useDerivedValue<number>(() => (armsUp ? 1 : 0));
  const op = useDerivedValue(() => prog(clock.value, at, at + 0.5));
  return <Adult clock={clock} x={xv} y={975} scale={1.1} look={look} armsUp={up} mood={mood} seed={seed} opacity={op} />;
}

/* ---------- Escena de la tienda (coordenadas 1600 × 1000) ---------- */
export function ShopScene({ clock }: { clock: Num }) {
  const t = clock;
  const signFont = useFont(Unbounded_800ExtraBold, 26);
  const signW = signFont ? signFont.getTextWidth(SIGN) : 0;

  // Motos de los delincuentes
  const motoA = useDerivedValue(() => mix(-420, THUGS[0].moto, easeOutQuint(prog(t.value, 4.2, 5.5))));
  const motoB = useDerivedValue(() => mix(-680, THUGS[1].moto, easeOutQuint(prog(t.value, 4.4, 5.7))));
  const riderA = useDerivedValue(() => 1 - prog(t.value, 5.8, 6.0));
  const riderB = useDerivedValue(() => 1 - prog(t.value, 6.0, 6.2));

  // Detección
  const recBlink = useDerivedValue<number>(() => (t.value > 6 && t.value < 13 && Math.floor(t.value * 2) % 2 === 0 ? 1 : 0));
  const gunEnd = useDerivedValue(() => prog(t.value, 7.5, 7.9));
  const knifeEnd = useDerivedValue(() => prog(t.value, 8.7, 9.1));
  const threatEnd = useDerivedValue(() => prog(t.value, 9.9, 10.3));
  const weaponOp = useDerivedValue(() => 1 - prog(t.value, 22.4, 22.8));
  const boxColor = useDerivedValue(() => (Math.floor(t.value * 3) % 2 === 0 ? '#FF4D57' : '#FFD0D3'));
  const threatColor = useDerivedValue(() => (t.value > 27.6 ? C.signal : C.sos));
  const threatOp = useDerivedValue(() => 1 - prog(t.value, 22.8, 23.2));
  const note = useDerivedValue(() => prog(t.value, 9.6, 9.7) * (1 - prog(t.value, 26.5, 27)));
  const rayShop = useDerivedValue(() => win(t.value, 6.7, 12.2, 0.3));
  const rayPhone = useDerivedValue(() => win(t.value, 7.1, 12.2, 0.3));
  const dash = useDerivedValue(() => -t.value * 40);

  // Alerta
  const ringA = useDerivedValue(() => win(t.value, 12, 13.2, 0.2) + win(t.value, 18.2, 20, 0.2));
  const ring0 = useDerivedValue(() => 30 + 170 * (((t.value - 12) * 0.6) % 1));
  const ring1 = useDerivedValue(() => 30 + 170 * (((t.value - 12) * 0.6 + 1 / 3) % 1));
  const ring2 = useDerivedValue(() => 30 + 170 * (((t.value - 12) * 0.6 + 2 / 3) % 1));
  const ringOp0 = useDerivedValue(() => ringA.value * (1 - (((t.value - 12) * 0.6) % 1)));
  const ringOp1 = useDerivedValue(() => ringA.value * (1 - (((t.value - 12) * 0.6 + 1 / 3) % 1)));
  const ringOp2 = useDerivedValue(() => ringA.value * (1 - (((t.value - 12) * 0.6 + 2 / 3) % 1)));
  const wake = useDerivedValue(() => prog(t.value, 12.4, 13.0));

  // Policía y final
  const carX = useDerivedValue(() => mix(2400, 1610, easeOutQuint(prog(t.value, 20.4, 22.3))));
  const badge = useDerivedValue<Transforms3d>(() => [
    { translateX: 655 }, { translateY: 596 }, { scale: Math.max(0.001, easeOutBack(prog(t.value, 27.8, 28.3))) },
  ]);
  const badgeOp = useDerivedValue(() => prog(t.value, 27.8, 28.0));
  const bulb = useDerivedValue(() => 0.85 + 0.15 * Math.sin(t.value * 5));

  return (
    <Group>
      {/* Cielo al atardecer */}
      <Rect x={-1400} y={-1000} width={4400} height={1800}>
        <LinearGradient start={vec(0, -600)} end={vec(0, 640)} colors={['#232861', '#6B4F8A', '#C9707A', '#F29A5C']} positions={[0, 0.55, 0.82, 1]} />
      </Rect>
      <Circle cx={170} cy={480} r={300}>
        <RadialGradient c={vec(170, 480)} r={300} colors={['rgba(255,190,120,0.6)', 'rgba(255,190,120,0)']} />
      </Circle>
      <Circle cx={170} cy={480} r={46} color="#FFD9A0" />
      <Path path={city.far} color="rgba(80,58,110,0.6)" />

      {/* Casa de la izquierda */}
      <Rect x={-600} y={340} width={1100} height={420} color="#6C9A90" />
      <Rect x={-610} y={328} width={1120} height={14} color="#557A72" />
      {[60, 260].map((wx) => (
        <Group key={wx}>
          <Rect x={wx} y={390} width={90} height={80} color="#2E3D5C" />
          <Rect x={wx} y={390} width={90} height={80} color="#E8DCC6" style="stroke" strokeWidth={6} />
        </Group>
      ))}
      <Rect x={100} y={600} width={120} height={80} color="#2E3D5C" />
      <Path path="M100 620H220M100 640H220M100 660H220M130 600V680M160 600V680M190 600V680" style="stroke" strokeWidth={3} color="#3E4A5E" />
      <Rect x={300} y={590} width={84} height={170} color="#6E4A34" />
      <Circle cx={372} cy={680} r={5} color="#C9A35A" />

      {/* Casa de la derecha, con el celular reciclado en la ventana */}
      <Rect x={1200} y={320} width={1000} height={440} color="#B97452" />
      <Rect x={1190} y={308} width={1020} height={14} color="#94593E" />
      <Rect x={1290} y={398} width={92} height={104} color="#0A1530" />
      <Rect x={1296} y={404} width={80} height={92} color="#3E5C8A" />
      <RoundedRect x={1324} y={424} width={22} height={40} r={4} color="#0B1631" />
      <RoundedRect x={1327} y={428} width={16} height={32} r={1.5} color="rgba(108,196,255,0.6)" />
      <Circle cx={1340} cy={436} r={2.6} color={C.sos} opacity={recBlink} />
      <Path path="M1335 464L1327 492M1335 464L1343 492" style="stroke" strokeWidth={2} color="#9FB4D8" />
      <Rect x={1284} y={498} width={104} height={8} color="#7A4A34" />
      <Rect x={1480} y={398} width={92} height={104} color="#2E3D5C" />
      <Rect x={1480} y={398} width={92} height={104} color="#E8DCC6" style="stroke" strokeWidth={6} />
      <Rect x={1260} y={600} width={220} height={160} color="#8A919E" />
      <Path path="M1260 616H1480M1260 634H1480M1260 652H1480M1260 670H1480M1260 688H1480M1260 706H1480M1260 724H1480M1260 742H1480" style="stroke" strokeWidth={3} color="#6F7682" />
      {/* Ventanas que se encienden con la alerta */}
      <Rect x={1480} y={398} width={92} height={104} color="#FFD27A" opacity={wake} />
      <Rect x={60} y={390} width={90} height={80} color="#FFD27A" opacity={wake} />

      {/* La tienda */}
      <Rect x={500} y={300} width={700} height={460} color="#E6B85C" />
      <Rect x={490} y={290} width={720} height={16} color="#C99A45" />
      {[580, 1020].map((wx) => (
        <Group key={wx}>
          <Rect x={wx} y={334} width={100} height={70} color="#2E3D5C" />
          <Rect x={wx} y={334} width={100} height={70} color="#F4EBDA" style="stroke" strokeWidth={6} />
          <RoundedRect x={wx - 6} y={404} width={112} height={12} r={3} color="#8C5A3C" />
          <Circle cx={wx + 20} cy={400} r={8} color="#E0457B" />
          <Circle cx={wx + 50} cy={398} r={8} color="#FFB547" />
          <Circle cx={wx + 80} cy={400} r={8} color="#E0457B" />
        </Group>
      ))}
      {/* Letrero */}
      <RoundedRect x={560} y={424} width={580} height={44} r={6} color="#C8202C" />
      {signFont && <Text x={850 - signW / 2} y={456} text={SIGN} font={signFont} color="#FFF4D6" />}
      {/* Toldo */}
      {AWNING.map((k) => (
        <Path key={k} path={`M${570 + k * 40} 468h40v30q-20 12 -40 0Z`} color={k % 2 ? '#F4F6FA' : '#C8202C'} />
      ))}

      {/* Interior */}
      <Rect x={590} y={505} width={520} height={255}>
        <LinearGradient start={vec(0, 505)} end={vec(0, 760)} colors={['#6B4E3A', '#4E3A2C']} />
      </Rect>
      <Circle cx={850} cy={540} r={160} color="rgba(255,214,150,0.35)" opacity={bulb}>
        <BlurMask blur={50} style="normal" />
      </Circle>
      {[570, 625].map((sy, row) => (
        <Group key={sy}>
          {Array.from({ length: 10 }).map((_, j) => (
            <RoundedRect key={j} x={612 + j * 40} y={sy - 28 + ((j + row) % 3) * 5} width={30} height={28 - ((j + row) % 3) * 5} r={3}
              color={PRODUCTS[(j + row * 3) % PRODUCTS.length]} opacity={0.9} />
          ))}
          <Rect x={600} y={sy} width={420} height={7} color="#3A2A1E" />
        </Group>
      ))}
      {/* Refrigeradora */}
      <Rect x={1030} y={515} width={72} height={245} color="#D8E2EE" />
      <Rect x={1036} y={522} width={60} height={200} color="rgba(140,210,255,0.55)" />
      {[540, 580, 620, 660, 700].map((by) => (
        <Path key={by} path={`M1044 ${by}h8v26h-8ZM1060 ${by}h8v26h-8ZM1076 ${by}h8v26h-8Z`} color={by % 80 ? '#E0457B' : '#FFB547'} />
      ))}
      {/* Foco */}
      <Path path="M850 505V528" style="stroke" strokeWidth={2} color="#2A1D16" />
      <Circle cx={850} cy={534} r={8} color="#FFE7A6" />
      {/* Cámara de la tienda */}
      <Rect x={596} y={510} width={16} height={6} color="#3A2A1E" />
      <RoundedRect x={604} y={514} width={30} height={16} r={4} color="#E7ECF5" />
      <Circle cx={630} cy={522} r={5} color="#0B1631" />
      <Circle cx={610} cy={519} r={2.5} color={C.sos} opacity={recBlink} />

      <RosaInside clock={t} />

      {/* Mostrador */}
      <Rect x={650} y={690} width={370} height={70} color="#6E5038" />
      <Rect x={650} y={714} width={370} height={6} color="#C8202C" />
      <Rect x={642} y={676} width={386} height={16} color="#8C6A4A" />
      <RoundedRect x={672} y={650} width={46} height={26} r={6} color="#C99A45" />
      <Circle cx={684} cy={652} r={8} color="#D9A066" />
      <Circle cx={700} cy={650} r={8} color="#C98A55" />
      <RoundedRect x={940} y={640} width={26} height={36} r={6} color="rgba(255,255,255,0.35)" />
      <Circle cx={948} cy={662} r={4} color="#E0457B" />
      <Circle cx={958} cy={656} r={4} color="#FFB547" />
      <RoundedRect x={975} y={662} width={34} height={14} r={3} color="#9AA6B8" />
      {/* Nota de extorsión */}
      <Group opacity={note} transform={[{ translateX: 905 }, { translateY: 668 }, { rotate: -0.12 }]}>
        <Rect x={-26} y={-12} width={52} height={22} color="#F7F3EA" />
        <Path path="M-20 -5h34M-20 1h40M-20 6h22" style="stroke" strokeWidth={2} color="#C8202C" />
      </Group>

      {/* Vereda y pista */}
      <Rect x={-1400} y={760} width={4400} height={46} color="#A39A8C" />
      <Path path="M-200 760l-10 46M0 760l-10 46M200 760l-10 46M400 760l-10 46M600 760l-10 46M800 760l-10 46M1000 760l-10 46M1200 760l-10 46M1400 760l-10 46M1600 760l-10 46M1800 760l-10 46"
        style="stroke" strokeWidth={2} color="rgba(60,50,40,0.3)" />
      <Rect x={-1400} y={806} width={4400} height={10} color="#C9C2B6" />
      <Rect x={-1400} y={816} width={4400} height={400}>
        <LinearGradient start={vec(0, 816)} end={vec(0, 1100)} colors={['#3B3F4D', '#24273A']} />
      </Rect>
      <Path path="M-400 890h80M-200 890h80M0 890h80M200 890h80M400 890h80M600 890h80M800 890h80M1000 890h80M1200 890h80M1400 890h80M1600 890h80M1800 890h80"
        style="stroke" strokeWidth={5} color="rgba(240,240,240,0.5)" />
      {/* Poste de luz */}
      <Rect x={1226} y={330} width={10} height={460} color="#3A4256" />
      <Path path="M1231 334q0 -18 -30 -18h-20" style="stroke" strokeWidth={7} color="#3A4256" />
      <Circle cx={1176} cy={322} r={22} color="rgba(255,227,163,0.7)">
        <BlurMask blur={12} style="normal" />
      </Circle>
      <RoundedRect x={1162} y={314} width={28} height={9} r={4} color="#FFF1CC" />

      <Customer clock={t} />
      {NEIGHBORS.map((n, i) => (
        <Neighbor key={i} clock={t} item={n} seed={70 + i} />
      ))}
      <Daughter clock={t} />
      <RosaOutside clock={t} />

      {/* Motos y motorizados */}
      <PoliceCar clock={t} x={carX} y={891} scale={1.4} flip />
      <Motorcycle clock={t} x={motoB} y={SHOP.street} scale={1.2} variant="thug" rider={riderB} />
      <Motorcycle clock={t} x={motoA} y={SHOP.street} scale={1.2} variant="thug" rider={riderA} />
      {THUGS.map((_, i) => (
        <Thug key={i} clock={t} i={i} />
      ))}
      <Stand clock={t} x={1000} look={OFFICER} mood={STERN} seed={80} at={23.1} />
      <Stand clock={t} x={1080} look={THUG_LOOKS[0]} mood={CAUGHT} armsUp seed={81} at={23.2} />
      <Stand clock={t} x={1160} look={THUG_LOOKS[1]} mood={CAUGHT} armsUp seed={82} at={23.3} />
      <Stand clock={t} x={1240} look={OFFICER2} mood={STERN} seed={83} at={23.1} />

      {/* Rayos de detección */}
      <Line p1={vec(SHOP_CAM.x, SHOP_CAM.y)} p2={vec(GUN_BOX.x, GUN_BOX.y)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayShop}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>
      <Line p1={vec(SHOP_CAM.x, SHOP_CAM.y)} p2={vec(THREAT.x, THREAT.y - 40)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayShop}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>
      <Line p1={vec(PHONE_CAM.x, PHONE_CAM.y)} p2={vec(KNIFE_BOX.x, KNIFE_BOX.y)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayPhone}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>

      {/* Ondas de alerta */}
      <Circle cx={SHOP.rosa} cy={615} r={ring0} color={C.sos} style="stroke" strokeWidth={3} opacity={ringOp0} />
      <Circle cx={SHOP.rosa} cy={615} r={ring1} color={C.sos} style="stroke" strokeWidth={3} opacity={ringOp1} />
      <Circle cx={SHOP.rosa} cy={615} r={ring2} color={C.sos} style="stroke" strokeWidth={3} opacity={ringOp2} />

      {/* Recuadros de la IA */}
      <Path path={brackets(GUN_BOX.x, GUN_BOX.y, 58, 46)} style="stroke" strokeWidth={3} strokeCap="round" color={boxColor} end={gunEnd} opacity={weaponOp} />
      <Path path={brackets(KNIFE_BOX.x, KNIFE_BOX.y, 64, 46)} style="stroke" strokeWidth={3} strokeCap="round" color={boxColor} end={knifeEnd} opacity={weaponOp} />
      <Path path={brackets(THREAT.x, THREAT.y, 150, 120, 20)} style="stroke" strokeWidth={3} strokeCap="round" color={threatColor} end={threatEnd} opacity={threatOp} />

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
