import React from 'react';
import {
  Blur, BlurMask, Circle, DashPathEffect, Group, Line, LinearGradient, Oval, Path, Points,
  RadialGradient, Rect, RoundedRect, vec,
} from '@shopify/react-native-skia';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { city, LAMPS } from './city';
import { easeInOut, easeOut, easeOutBack, easeOutQuint, mix, prog, win } from './math';
import { Adult, Girl, type Look, type Mood } from './Figures';
import { Drone, PoliceCar, Van } from './Vehicles';
import { C } from './theme';

type Num = SharedValue<number>;

/* ---------- Personajes que llegan ---------- */
type Arrival = { x0: number; x1: number; d: number; look: Look };

const NEIGHBORS: Arrival[] = [
  { x0: -80, x1: 860, d: 0, look: { body: '#4E6BA8', legs: '#33497A', skin: '#B9825B', hair: 'short' } },
  { x0: -20, x1: 905, d: 0.3, look: { body: '#9FC3E8', legs: '#45386A', skin: '#F0C9A6', hair: 'long', hairColor: '#5A3A22', stripes: true } },
  { x0: 1660, x1: 1125, d: 0.2, look: { body: '#B8901F', legs: '#2B3F5E', skin: '#8D5B3C', hair: 'short' } },
  { x0: 1720, x1: 1170, d: 0.5, look: { body: '#6B7FA8', legs: '#33497A', skin: '#C68E62', hair: 'none' } },
  { x0: 1790, x1: 1215, d: 0.8, look: { body: '#3E5C96', legs: '#26365A', skin: '#E2B08A', hair: 'short', hairColor: '#6B4A2E' } },
];
const PARENTS: Arrival[] = [
  { x0: 1760, x1: 1040, d: 0, look: { body: '#C2414B', legs: '#2C2F45', skin: '#E2B08A', hair: 'long' } },
  { x0: 1830, x1: 1082, d: 0.3, look: { body: '#556B8F', legs: '#26365A', skin: '#C68E62', hair: 'short' } },
];
const OFFICER: Look = { body: '#1E3A7A', legs: '#14213F', skin: '#B9825B', officer: true };
const OFFICER2: Look = { ...OFFICER, skin: '#E2B08A' };
const SUSPECT: Look = { body: '#5A6172', legs: '#1A1D24', skin: '#D9A47C', hair: 'hood' };
const SUSPECT2: Look = { ...SUSPECT, skin: '#9A6A48' };

/** Vecinos: llegan preocupados y sonríen cuando Valentina está a salvo. Papás: llegan con pánico, abren los brazos y se alivian. */
function Walker({ clock, item, t0, dur, phone, parent, seed }: { clock: Num; item: Arrival; t0: number; dur: number; phone?: boolean; parent?: boolean; seed: number }) {
  const p = useDerivedValue(() => prog(clock.value, t0 + item.d, t0 + item.d + dur));
  const x = useDerivedValue(() => mix(item.x0, item.x1, easeOut(p.value)));
  const walk = useDerivedValue<number>(() => (p.value > 0 && p.value < 0.97 ? 1 : 0));
  const glow = useDerivedValue(() => (phone ? 0.6 + 0.4 * Math.sin(clock.value * 3 + item.d * 5) : 0));
  const joy = useDerivedValue(() => prog(clock.value, 27.6 + item.d * 0.3, 28.4 + item.d * 0.3));
  const fear = useDerivedValue(() => (parent ? 1 - prog(clock.value, 25, 26) : 0) * (1 - joy.value));
  const worry = useDerivedValue(() => (parent ? 0.8 : 1) * (1 - joy.value) * (1 - fear.value));
  const reach = useDerivedValue(() => (parent ? 0.12 * prog(clock.value, t0 + item.d + dur - 0.4, t0 + item.d + dur + 0.6) : 0));
  const mood: Mood = { fear, worry, joy };
  return <Adult clock={clock} x={x} y={748} look={item.look} walk={walk} armsUp={reach} phone={phone ? glow : undefined} mood={mood} seed={seed} />;
}

function Static({ clock, x, look, armsUp, mood, seed }: { clock: Num; x: number; look: Look; armsUp?: boolean; mood: Mood; seed: number }) {
  const xv = useDerivedValue<number>(() => x);
  const up = useDerivedValue<number>(() => (armsUp ? 1 : 0));
  return <Adult clock={clock} x={xv} y={880} look={look} armsUp={up} mood={mood} seed={seed} />;
}

const STERN: Mood = { focus: 1 };
const CAUGHT: Mood = { fear: 0.55, worry: 0.6 };

/* ---------- Escena de la calle (coordenadas 1600 × 1000) ---------- */
export function Street({ clock }: { clock: Num }) {
  const t = clock;

  // Cielo y ciudad
  const twinkle = useDerivedValue(() => 0.55 + 0.45 * Math.sin(t.value * 2.1));
  const twinkle2 = useDerivedValue(() => 0.55 + 0.45 * Math.cos(t.value * 1.7));
  const wake0 = useDerivedValue(() => prog(t.value, 12.35, 12.8));
  const wake1 = useDerivedValue(() => prog(t.value, 12.7, 13.1));
  const wake2 = useDerivedValue(() => prog(t.value, 13.0, 13.4));
  const netOp = useDerivedValue(() => win(t.value, 12.3, 27, 0.4) * (t.value > 20 ? 0.25 : 0.6));
  const netPhase = useDerivedValue(() => -t.value * 30);

  // Valentina
  const girlX = useDerivedValue(() =>
    t.value < 6 ? mix(820, 1000, prog(t.value, 0.3, 5.8)) : mix(1000, 986, easeOut(prog(t.value, 8.9, 9.3))),
  );
  const girlWalk = useDerivedValue<number>(() => (t.value > 0.3 && t.value < 5.8 ? 1 : 0));
  const fear = useDerivedValue(() => easeOut(prog(t.value, 8.95, 9.3)) * (1 - prog(t.value, 24.5, 25.2)));
  const girlJoy = useDerivedValue(() => easeOut(prog(t.value, 27.5, 28.3)));
  const girlWorry = useDerivedValue(() => Math.max(prog(t.value, 4.6, 5.4), prog(t.value, 24.5, 25.2)) * (1 - fear.value) * (1 - girlJoy.value));
  const girlTears = useDerivedValue(() => win(t.value, 10.2, 27.4, 0.6));
  const girlMood: Mood = { fear, worry: girlWorry, joy: girlJoy, tears: girlTears };

  // Camioneta
  const vanX = useDerivedValue(() =>
    t.value < 20 ? mix(1780, 1130, easeOut(prog(t.value, 0.8, 5.2))) : mix(1130, 1112, easeOut(prog(t.value, 20.6, 21.2))),
  );
  const door = useDerivedValue(() => 36 * easeInOut(prog(t.value, 6.3, 7.1)) * (1 - prog(t.value, 12.6, 13.1)));

  // Patrulla y detención
  const copX = useDerivedValue(() => mix(-520, 842, easeOutQuint(prog(t.value, 20.2, 22.4))));
  const arrest = useDerivedValue(() => prog(t.value, 22.6, 23.1));

  // Dron
  const dP = useDerivedValue(() => easeOut(prog(t.value, 6.6, 9.0)));
  const droneX = useDerivedValue(() => mix(1800, 1080, dP.value));
  const droneY = useDerivedValue(() => mix(80, 270, dP.value));
  const spot = useDerivedValue(() => prog(t.value, 27.4, 28.4));

  // Detección
  const sweepX = useDerivedValue(() => mix(560, 1640, prog(t.value, 6.05, 7.1)));
  const sweepOp = useDerivedValue(() => win(t.value, 6.05, 7.1, 0.15));
  const sweepTr = useDerivedValue<Transforms3d>(() => [{ translateX: sweepX.value }]);
  const rayIp = useDerivedValue(() => win(t.value, 6.6, 12.2, 0.3));
  const rayPhone = useDerivedValue(() => win(t.value, 7.0, 12.2, 0.3));
  const rayDrone = useDerivedValue(() => win(t.value, 9.0, 12.2, 0.3));
  const dash = useDerivedValue(() => -t.value * 40);
  const droneP1 = useDerivedValue(() => ({ x: droneX.value, y: droneY.value + 14 }));
  const recBlink = useDerivedValue<number>(() => (t.value > 6 && t.value < 13 && Math.floor(t.value * 2) % 2 === 0 ? 1 : 0));

  const gunEnd = useDerivedValue(() => prog(t.value, 7.3, 7.8));
  const gunOp = useDerivedValue(() => (t.value < 7.3 ? 0 : 1 - prog(t.value, 22.6, 23.0)));
  const gunColor = useDerivedValue(() => (Math.floor(t.value * 3) % 2 === 0 ? '#FF4D57' : '#FFD0D3'));
  const girlEnd = useDerivedValue(() => prog(t.value, 9.4, 9.9));
  const girlBoxColor = useDerivedValue(() => (t.value > 27.6 ? C.signal : C.sos));

  // Alerta
  const ringA = useDerivedValue(() => win(t.value, 12, 13.2, 0.2) + win(t.value, 18.2, 20, 0.2));
  const rings = [0, 1, 2].map((k) => {
    const r = useDerivedValue(() => 30 + 150 * (((t.value - 12) * 0.6 + k / 3) % 1));
    const o = useDerivedValue(() => ringA.value * (1 - (((t.value - 12) * 0.6 + k / 3) % 1)));
    return { r, o };
  });

  // Final
  const badge = useDerivedValue<Transforms3d>(() => [
    { translateX: 991 }, { translateY: 598 }, { scale: Math.max(0.001, easeOutBack(prog(t.value, 27.8, 28.3))) },
  ]);
  const badgeOp = useDerivedValue(() => prog(t.value, 27.8, 28.0));

  return (
    <Group>
      {/* Cielo */}
      <Rect x={-1400} y={-1000} width={4400} height={1720}>
        <LinearGradient start={vec(0, -1000)} end={vec(0, 720)} colors={['#02061A', '#081333', '#132854', '#1F3B6E']} positions={[0, 0.5, 0.86, 1]} />
      </Rect>
      <Points points={city.stars1} mode="points" color="#DCE6FF" strokeWidth={2.2} strokeCap="round" opacity={twinkle} />
      <Points points={city.stars2} mode="points" color="#DCE6FF" strokeWidth={1.4} strokeCap="round" opacity={twinkle2} />
      <Circle cx={300} cy={150} r={150}>
        <RadialGradient c={vec(300, 150)} r={150} colors={['rgba(220,230,255,0.35)', 'rgba(220,230,255,0)']} />
      </Circle>
      <Circle cx={300} cy={150} r={34} color="#E3E9F7" />

      {/* Ciudad */}
      <Path path={city.far} color="#0D1B3E" />
      <Rect x={-1400} y={380} width={4400} height={340}>
        <LinearGradient start={vec(0, 380)} end={vec(0, 720)} colors={['rgba(90,130,200,0)', 'rgba(90,130,200,0.16)']} />
      </Rect>
      <Path path={city.near} color="#162A52" />
      <Path path={city.roofs} color="#22406F" />
      <Path path={city.winDark} color="#0E1A38" />
      <Path path={city.winOn} color="rgba(255,196,110,0.55)">
        <BlurMask blur={7} style="normal" />
      </Path>
      <Path path={city.winOn} color="#D9A955" />
      {[wake0, wake1, wake2].map((op, i) => (
        <Group key={i} opacity={op}>
          <Path path={city.winWake[i]} color="rgba(255,210,122,0.6)">
            <BlurMask blur={8} style="normal" />
          </Path>
          <Path path={city.winWake[i]} color="#FFD27A" />
        </Group>
      ))}

      {/* Ventana con el celular reciclado */}
      <Rect x={1292} y={432} width={80} height={100} color="#0A1530" />
      <Rect x={1298} y={438} width={68} height={88} color="#22457A" />
      <RoundedRect x={1321} y={456} width={22} height={40} r={4} color="#0B1631" />
      <RoundedRect x={1324} y={460} width={16} height={32} r={1.5} color="rgba(108,196,255,0.55)" />
      <Circle cx={1337} cy={468} r={2.6} color={C.sos} opacity={recBlink} />
      <Path path="M1332 496L1324 524M1332 496L1340 524" style="stroke" strokeWidth={2} color="#9FB4D8" />
      <Rect x={1288} y={526} width={88} height={7} color="#2A4373" />

      {/* Red de vecinos */}
      <Path path={city.net} style="stroke" strokeWidth={1.6} color="#FFD27A" opacity={netOp}>
        <DashPathEffect intervals={[3, 7]} phase={netPhase} />
      </Path>

      {/* Calle mojada */}
      <Rect x={-1400} y={700} width={4400} height={62} color="#1D3664" />
      <Rect x={-1400} y={760} width={4400} height={8} color="#2D4A80" />
      <Rect x={-1400} y={768} width={4400} height={700}>
        <LinearGradient start={vec(0, 768)} end={vec(0, 1100)} colors={['#0F1C3A', '#050A1A']} />
      </Rect>
      <Path path={city.lanes} color="#33486F" />
      {LAMPS.map((lx) => (
        <Oval key={`refl${lx}`} x={lx - 26} y={790} width={52} height={190} color="rgba(255,220,150,0.22)">
          <BlurMask blur={14} style="normal" />
        </Oval>
      ))}

      {/* Postes de luz */}
      {LAMPS.map((lx) => (
        <Group key={`lamp${lx}`}>
          <Path path={`M${lx - 11} 352L${lx + 11} 352L${lx + 105} 742L${lx - 105} 742Z`}>
            <LinearGradient start={vec(0, 352)} end={vec(0, 742)} colors={['rgba(255,227,163,0.38)', 'rgba(255,227,163,0)']} />
            <Blur blur={8} />
          </Path>
          <Oval x={lx - 120} y={728} width={240} height={28} color="rgba(255,227,163,0.16)">
            <BlurMask blur={8} style="normal" />
          </Oval>
          <Rect x={lx - 65} y={360} width={8} height={340} color="#22355E" />
          <Path path={`M${lx - 61} 362q0 -18 30 -18h20`} style="stroke" strokeWidth={7} color="#22355E" />
          <RoundedRect x={lx - 17} y={338} width={34} height={10} r={4} color="#2E4475" />
          <Circle cx={lx} cy={352} r={24} color="rgba(255,227,163,0.85)">
            <BlurMask blur={14} style="normal" />
          </Circle>
          <Oval x={lx - 14} y={346} width={28} height={8} color="#FFF1CC" />
        </Group>
      ))}

      {/* Cámara IP en el poste */}
      <Rect x={903} y={447} width={14} height={7} color="#3A4F7A" />
      <Group origin={vec(918, 452)} transform={[{ rotate: 0.49 }]}>
        <RoundedRect x={914} y={441} width={46} height={20} r={5} color="#E7ECF5" />
        <RoundedRect x={912} y={438} width={50} height={5} r={2} color="#C5CFE0" />
        <Circle cx={958} cy={451} r={7} color="#0B1631" />
        <Circle cx={924} cy={451} r={3} color={C.sos} opacity={recBlink} />
      </Group>

      {/* Barrido de la IA */}
      <Group transform={sweepTr} opacity={sweepOp}>
        <Rect x={-60} y={120} width={120} height={780}>
          <LinearGradient start={vec(-60, 0)} end={vec(60, 0)} colors={['rgba(108,196,255,0)', 'rgba(108,196,255,0.35)', 'rgba(108,196,255,0)']} />
        </Rect>
        <Rect x={-1} y={120} width={2} height={780} color="rgba(160,220,255,0.9)" />
      </Group>

      {/* Rayos de detección */}
      <Line p1={vec(955, 472)} p2={vec(995, 640)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayIp}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>
      <Line p1={vec(1332, 478)} p2={vec(1262, 806)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayPhone}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>
      <Line p1={droneP1} p2={vec(995, 630)} color={C.scan} style="stroke" strokeWidth={2} opacity={rayDrone}>
        <DashPathEffect intervals={[6, 8]} phase={dash} />
      </Line>

      {/* Personas en la vereda */}
      <Girl clock={t} x={girlX} walk={girlWalk} fear={fear} mood={girlMood} />
      {NEIGHBORS.map((n, i) => (
        <Walker key={`n${i}`} clock={t} item={n} t0={17.0} dur={3.0} phone seed={i + 1} />
      ))}
      {PARENTS.map((n, i) => (
        <Walker key={`p${i}`} clock={t} item={n} t0={21.0} dur={3.2} parent seed={i + 7} />
      ))}

      {/* Vehículos */}
      <Van x={vanX} door={door} />
      <PoliceCar clock={t} x={copX} />
      <Group opacity={arrest}>
        <Static clock={t} x={1094} look={OFFICER} mood={STERN} seed={3.1} />
        <Static clock={t} x={1162} look={SUSPECT} armsUp mood={CAUGHT} seed={4.2} />
        <Static clock={t} x={1230} look={SUSPECT2} armsUp mood={CAUGHT} seed={5.3} />
        <Static clock={t} x={1298} look={OFFICER2} mood={STERN} seed={6.4} />
      </Group>
      <Drone clock={t} x={droneX} y={droneY} spot={spot} />

      {/* Ondas de alerta */}
      {rings.map((rg, i) => (
        <Circle key={`ring${i}`} cx={995} cy={690} r={rg.r} color={C.sos} style="stroke" strokeWidth={3} opacity={rg.o} />
      ))}

      {/* Recuadros de la IA */}
      <Path
        path="M1236 796V780H1252M1272 780H1288V796M1288 818V834H1272M1252 834H1236V818"
        style="stroke" strokeWidth={3.5} strokeCap="round" color={gunColor} end={gunEnd} opacity={gunOp}
      />
      <Path
        path="M956 648V628H976M1006 628H1026V648M1026 730V750H1006M976 750H956V730"
        style="stroke" strokeWidth={3} strokeCap="round" color={girlBoxColor} end={girlEnd}
      />

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
