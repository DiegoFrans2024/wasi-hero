import React from 'react';
import { Blur, BlurMask, Circle, Group, LinearGradient, Oval, Path, Rect, RoundedRect, vec } from '@shopify/react-native-skia';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

type Num = SharedValue<number>;

const VAN_BODY = 'M0 -30L0 -72Q2 -88 22 -94L58 -116Q62 -118 70 -118L250 -118Q262 -118 262 -106L262 -30Q262 -22 254 -22L8 -22Q0 -22 0 -30Z';
const CAR_BODY = 'M0 -30V-64Q0 -72 10 -73L58 -78L84 -104Q88 -108 96 -108H160Q167 -108 171 -103L194 -78L230 -74Q240 -72 240 -63V-30Q240 -22 232 -22H8Q0 -22 0 -30Z';

function Wheel({ cx }: { cx: number }) {
  return (
    <>
      <Circle cx={cx} cy={-14} r={20} color="#07090D" />
      <Circle cx={cx} cy={-14} r={8} color="#5A6070" />
    </>
  );
}

/** Camioneta sin placas. Mira a la izquierda. Al abrir la puerta se ve a un hombre armado. */
export function Van({ x, door }: { x: Num; door: Num }) {
  const tr = useDerivedValue<Transforms3d>(() => [{ translateX: x.value }, { translateY: 850 }]);
  const doorTr = useDerivedValue<Transforms3d>(() => [{ translateX: door.value }]);
  return (
    <Group transform={tr}>
      {/* Haz de los faros */}
      <Path path="M4 -57L-420 -125L-420 16Z" opacity={0.9}>
        <LinearGradient start={vec(0, 0)} end={vec(-420, 0)} colors={['rgba(255,231,166,0.55)', 'rgba(255,231,166,0)']} />
        <Blur blur={6} />
      </Path>
      {/* Reflejo en el asfalto mojado */}
      <Oval x={-140} y={4} width={150} height={26} color="rgba(255,231,166,0.28)">
        <BlurMask blur={12} style="normal" />
      </Oval>
      <Path path={VAN_BODY} color="#2A2F3A" />
      <Path path="M262 -106V-30" style="stroke" strokeWidth={2} color="#3A404C" />
      <Path path="M14 -76Q16 -86 30 -90L60 -108L84 -108L84 -76Z" color="#14233F" />
      <RoundedRect x={90} y={-108} width={18} height={30} r={3} color="#14233F" />
      <Rect x={116} y={-108} width={70} height={80} color="#04060B" />
      {/* Sospechoso armado, visible solo con la puerta abierta */}
      <Circle cx={139} cy={-91} r={9} color="#5A6275" />
      <Path path="M127 -78Q127 -83 139 -83Q151 -83 151 -78V-30H127Z" color="#4A5263" />
      <RoundedRect x={125} y={-80} width={7} height={30} r={3.5} color="#5A6275" />
      <Group transform={[{ translateX: 129 }, { translateY: -52 }, { rotate: -1.31 }, { scale: 1.3 }]}>
        <RoundedRect x={-20} y={-4} width={22} height={7} r={1.5} color="#0B0D12" />
        <RoundedRect x={-20} y={-4} width={22} height={7} r={1.5} color="#B4BDCE" style="stroke" strokeWidth={1.3} />
        <Group transform={[{ translateX: -2 }, { translateY: 1 }, { rotate: 0.24 }]}>
          <RoundedRect x={-3} y={0} width={6} height={11} r={1.5} color="#0B0D12" />
          <RoundedRect x={-3} y={0} width={6} height={11} r={1.5} color="#B4BDCE" style="stroke" strokeWidth={1.3} />
        </Group>
      </Group>
      <Group transform={doorTr}>
        <Rect x={116} y={-108} width={70} height={80} color="#30363F" />
        <RoundedRect x={122} y={-102} width={58} height={26} r={3} color="#14233F" />
      </Group>
      <RoundedRect x={196} y={-108} width={56} height={30} r={3} color="#14233F" />
      <RoundedRect x={0} y={-62} width={8} height={10} r={2} color="#FFE7A6" />
      <Circle cx={4} cy={-57} r={16} color="rgba(255,231,166,0.8)">
        <BlurMask blur={12} style="normal" />
      </Circle>
      <Rect x={257} y={-62} width={5} height={14} color="#B5121D" />
      <RoundedRect x={-3} y={-34} width={14} height={8} r={2} color="#1A1E26" />
      <Wheel cx={56} />
      <Wheel cx={212} />
    </Group>
  );
}

/** Patrulla. Mira a la derecha (o a la izquierda con `flip`). Las luces alternan rojo y azul. */
export function PoliceCar({ clock, x, y = 858, scale = 1, flip = false }: { clock: Num; x: Num; y?: number; scale?: number; flip?: boolean }) {
  const tr = useDerivedValue<Transforms3d>(() => [{ translateX: x.value }, { translateY: y }, { scaleX: flip ? -scale : scale }, { scaleY: scale }]);
  const red = useDerivedValue(() => (Math.floor(clock.value * 6) % 2 === 0 ? 1 : 0.15));
  const blue = useDerivedValue(() => 1.15 - red.value);
  return (
    <Group transform={tr}>
      {/* Luces de la sirena reflejadas en el piso mojado */}
      <Oval x={40} y={0} width={120} height={60} color="rgba(225,29,42,0.5)" opacity={red}>
        <BlurMask blur={22} style="normal" />
      </Oval>
      <Oval x={110} y={0} width={120} height={60} color="rgba(59,130,246,0.5)" opacity={blue}>
        <BlurMask blur={22} style="normal" />
      </Oval>
      <Path path={CAR_BODY} color="#EEF2F8" />
      <Rect x={0} y={-58} width={240} height={16} color="#1D3F8F" />
      <Path path="M90 -102H126V-80H68Z" color="#14233F" />
      <Path path="M132 -102H166L186 -80H132Z" color="#14233F" />
      <Group opacity={red}>
        <Circle cx={115} cy={-112} r={34} color="rgba(225,29,42,0.75)">
          <BlurMask blur={20} style="normal" />
        </Circle>
        <RoundedRect x={104} y={-117} width={22} height={9} r={2} color="#FF3B47" />
      </Group>
      <Group opacity={blue}>
        <Circle cx={137} cy={-112} r={34} color="rgba(59,130,246,0.75)">
          <BlurMask blur={20} style="normal" />
        </Circle>
        <RoundedRect x={126} y={-117} width={22} height={9} r={2} color="#4C8DFF" />
      </Group>
      <RoundedRect x={234} y={-68} width={6} height={9} r={2} color="#FFE7A6" />
      <Rect x={0} y={-68} width={5} height={10} color="#B5121D" />
      <Wheel cx={52} />
      <Wheel cx={190} />
    </Group>
  );
}

/** Dron con luz que ilumina a Valentina al final. */
export function Drone({ clock, x, y, spot }: { clock: Num; x: Num; y: Num; spot: Num }) {
  const tr = useDerivedValue<Transforms3d>(() => [
    { translateX: x.value },
    { translateY: y.value + Math.sin(clock.value * 2.6) * 6 },
  ]);
  const rotor = useDerivedValue<Transforms3d>(() => [{ scaleX: 0.25 + 0.75 * Math.abs(Math.sin(clock.value * 40)) }]);
  return (
    <Group transform={tr}>
      <Group opacity={spot}>
        <Path path="M-5 14L5 14L-8 478L-152 478Z">
          <LinearGradient start={vec(0, 0)} end={vec(0, 478)} colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.08)']} />
          <Blur blur={4} />
        </Path>
        <Oval x={-162} y={466} width={164} height={24} color="rgba(255,255,255,0.35)">
          <BlurMask blur={10} style="normal" />
        </Oval>
      </Group>
      <Path path="M-46 -12L-16 -2M46 -12L16 -2" style="stroke" strokeWidth={4} strokeCap="round" color="#9AA9C4" />
      <Group origin={vec(-48, -14)} transform={rotor}>
        <Oval x={-70} y={-17} width={44} height={6} color="rgba(201,212,232,0.75)" />
      </Group>
      <Group origin={vec(48, -14)} transform={rotor}>
        <Oval x={26} y={-17} width={44} height={6} color="rgba(201,212,232,0.75)" />
      </Group>
      <RoundedRect x={-22} y={-8} width={44} height={16} r={8} color="#DDE4F0" />
      <Circle cx={0} cy={12} r={6} color="#0B1631" />
      <Circle cx={-18} cy={0} r={2.5} color="#E11D2A" />
      <Circle cx={18} cy={0} r={2.5} color="#22C55E" />
    </Group>
  );
}

/** Moto de policía con su conductor. Mira a la derecha (o a la izquierda con `flip`). Origen en el piso. */
export function Motorcycle({ clock, x, y, scale = 1, flip = false }: { clock: Num; x: Num; y: number; scale?: number; flip?: boolean }) {
  const tr = useDerivedValue<Transforms3d>(() => [{ translateX: x.value }, { translateY: y }, { scaleX: flip ? -scale : scale }, { scaleY: scale }]);
  const red = useDerivedValue(() => (Math.floor(clock.value * 7) % 2 === 0 ? 1 : 0.15));
  const blue = useDerivedValue(() => 1.15 - red.value);
  return (
    <Group transform={tr}>
      <Oval x={-70} y={-6} width={140} height={14} color="rgba(0,0,0,0.35)">
        <BlurMask blur={6} style="normal" />
      </Oval>
      <Circle cx={-42} cy={-22} r={22} color="#07090D" />
      <Circle cx={-42} cy={-22} r={9} color="#5A6070" />
      <Circle cx={44} cy={-22} r={22} color="#07090D" />
      <Circle cx={44} cy={-22} r={9} color="#5A6070" />
      <Path path="M44 -22L32 -72" style="stroke" strokeWidth={5} strokeCap="round" color="#2A2F3A" />
      <Path path="M-56 -40L-24 -60H18L36 -66L58 -46L44 -32H-38Z" color="#EEF2F8" />
      <Path path="M-48 -44H40" style="stroke" strokeWidth={5} color="#1D3F8F" />
      <RoundedRect x={-34} y={-68} width={40} height={9} r={4} color="#14181F" />
      <Path path="M30 -70L40 -98L47 -96L40 -66Z" color="rgba(170,200,255,0.6)" />
      <Circle cx={58} cy={-50} r={14} color="rgba(255,231,166,0.75)">
        <BlurMask blur={9} style="normal" />
      </Circle>
      {/* Conductor */}
      <Path path="M-6 -64L14 -36L18 -24" style="stroke" strokeWidth={9} strokeCap="round" strokeJoin="round" color="#14213F" />
      <RoundedRect x={-16} y={-114} width={26} height={52} r={9} color="#1E3A7A" />
      <Path path="M2 -102L32 -74" style="stroke" strokeWidth={7} strokeCap="round" color="#1E3A7A" />
      <RoundedRect x={-8} y={-106} width={14} height={6} r={2} color="#E0B341" />
      <Circle cx={-2} cy={-126} r={14} color="#F4F6FA" />
      <RoundedRect x={0} y={-131} width={14} height={8} r={3} color="#14233F" />
      {/* Sirena */}
      <Path path="M-44 -58V-94" style="stroke" strokeWidth={3} color="#9AA6B8" />
      <Group opacity={red}>
        <Circle cx={-44} cy={-98} r={18} color="rgba(225,29,42,0.7)">
          <BlurMask blur={12} style="normal" />
        </Circle>
        <Circle cx={-44} cy={-98} r={5} color="#FF3B47" />
      </Group>
      <Group opacity={blue}>
        <Circle cx={-44} cy={-98} r={18} color="rgba(59,130,246,0.7)">
          <BlurMask blur={12} style="normal" />
        </Circle>
      </Group>
    </Group>
  );
}
