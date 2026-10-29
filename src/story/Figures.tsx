import React from 'react';
import { BlurMask, Circle, Group, Path, RoundedRect, vec } from '@shopify/react-native-skia';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

type Num = SharedValue<number>;

const TORSO = 'M-17 -58V-118Q-17 -134 0 -134Q17 -134 17 -118V-58Z';
const HAIR_LONG = 'M-14 -150Q-14 -166 0 -166Q14 -166 14 -150L17 -120L-17 -120Z';
const HAIR_SHORT = 'M-13 -156Q-12 -168 0 -168Q13 -168 13 -156Q6 -161 0 -160Q-7 -160 -13 -156Z';
const HOOD = 'M-16 -146Q-16 -168 0 -168Q16 -168 16 -146L16 -134L-16 -134Z';

export type Look = {
  body: string;
  legs: string;
  skin: string;
  hair?: 'short' | 'long' | 'cap' | 'hood' | 'none';
  hairColor?: string;
  stripes?: boolean;
  officer?: boolean;
};

type AdultProps = {
  clock: Num;
  x: Num;
  y: number;
  look: Look;
  scale?: number;
  walk?: Num;    // 0 quieto, 1 caminando o corriendo
  armsUp?: Num;  // 0 brazos abajo, 1 manos arriba
  phone?: Num;   // brillo del celular en la mano (0..1)
  opacity?: Num | number;
};

/** Persona adulta en silueta ilustrada. Origen en los pies. */
export function Adult({ clock, x, y, look, scale = 1, walk, armsUp, phone, opacity = 1 }: AdultProps) {
  const tr = useDerivedValue<Transforms3d>(() => [{ translateX: x.value }, { translateY: y }, { scale }]);
  const swing = useDerivedValue(() => (walk ? walk.value : 0) * Math.sin(clock.value * 15) * 0.55);
  const legA = useDerivedValue<Transforms3d>(() => [{ rotate: swing.value }]);
  const legB = useDerivedValue<Transforms3d>(() => [{ rotate: -swing.value }]);
  const up = useDerivedValue(() => (armsUp ? armsUp.value : 0) * (Math.PI - 0.3));
  const armL = useDerivedValue<Transforms3d>(() => [{ rotate: up.value - swing.value * 0.7 }]);
  const armR = useDerivedValue<Transforms3d>(() => [{ rotate: -up.value + swing.value * 0.7 }]);
  const glow = useDerivedValue(() => (phone ? phone.value : 0));

  const legBack = shade(look.legs);
  return (
    <Group transform={tr} opacity={opacity}>
      <Group origin={vec(5, -62)} transform={legB}>
        <RoundedRect x={1} y={-62} width={8} height={62} r={3} color={legBack} />
      </Group>
      <Group origin={vec(-5, -62)} transform={legA}>
        <RoundedRect x={-9} y={-62} width={8} height={62} r={3} color={look.legs} />
      </Group>
      {look.hair === 'long' && <Path path={HAIR_LONG} color={look.hairColor ?? '#2B1B14'} />}
      {look.hair === 'hood' && <Path path={HOOD} color={shade(look.body)} />}
      <Path path={TORSO} color={look.body} />
      {look.stripes && (
        <Path path="M-17 -102H17M-17 -86H17M-17 -70H17" style="stroke" strokeWidth={3} color="#7FA6D3" />
      )}
      {look.officer && (
        <>
          <RoundedRect x={-17} y={-80} width={34} height={5} r={1} color="#0F1A33" />
          <Circle cx={8} cy={-117} r={3} color="#E0B341" />
        </>
      )}
      <Group origin={vec(-20, -124)} transform={armL}>
        <RoundedRect x={-24} y={-124} width={7} height={46} r={3.5} color={look.body} />
      </Group>
      <Group origin={vec(20, -124)} transform={armR}>
        <RoundedRect x={17} y={-124} width={7} height={46} r={3.5} color={look.body} />
        {phone && (
          <Group opacity={glow}>
            <Circle cx={22} cy={-78} r={14} color="rgba(230,243,255,0.7)">
              <BlurMask blur={9} style="normal" />
            </Circle>
            <RoundedRect x={18} y={-86} width={8} height={13} r={1.5} color="#EAF5FF" />
          </Group>
        )}
      </Group>
      <Circle cx={0} cy={look.hair === 'hood' ? -148 : -149} r={look.hair === 'hood' ? 10.5 : 13} color={look.skin} />
      {look.hair === 'short' && <Path path={HAIR_SHORT} color={look.hairColor ?? '#20160F'} />}
      {look.hair === 'long' && (
        <Path path="M-13 -152Q-12 -165 0 -165Q13 -165 13 -152Q6 -158 0 -157Q-7 -157 -13 -152Z" color={look.hairColor ?? '#2B1B14'} />
      )}
      {(look.hair === 'cap' || look.officer) && (
        <>
          <RoundedRect x={-14} y={-166} width={28} height={11} r={3} color="#0F1A33" />
          <RoundedRect x={-2} y={-158} width={20} height={3} r={1} color="#0F1A33" />
        </>
      )}
    </Group>
  );
}

type GirlProps = { clock: Num; x: Num; walk: Num; fear: Num };

/** Valentina. Mira hacia la derecha. Origen en los pies. */
export function Girl({ clock, x, walk, fear }: GirlProps) {
  const tr = useDerivedValue<Transforms3d>(() => [{ translateX: x.value }, { translateY: 745 }, { scale: 1.25 }]);
  const swing = useDerivedValue(() => walk.value * Math.sin(clock.value * 11) * 0.38);
  const trembling = useDerivedValue(() => fear.value * Math.sin(clock.value * 60) * 0.04);
  const legA = useDerivedValue<Transforms3d>(() => [{ rotate: swing.value }]);
  const legB = useDerivedValue<Transforms3d>(() => [{ rotate: -swing.value }]);
  const armFront = useDerivedValue<Transforms3d>(() => [{ rotate: -swing.value - fear.value * 2.6 + trembling.value }]);
  const armBack = useDerivedValue<Transforms3d>(() => [{ rotate: swing.value - fear.value * 2.3 + trembling.value }]);
  const body = useDerivedValue<Transforms3d>(() => [{ rotate: -fear.value * 0.08 + trembling.value * 0.3 }]);

  return (
    <Group transform={tr}>
      <Group origin={vec(0, 0)} transform={body}>
        <Group origin={vec(2, -30)} transform={legB}>
          <RoundedRect x={-1} y={-30} width={6} height={30} r={3} color="#D9A47C" />
        </Group>
        <Group origin={vec(1, -64)} transform={armBack}>
          <RoundedRect x={-4} y={-64} width={5} height={22} r={2.5} color="#D9A47C" />
        </Group>
        <RoundedRect x={-21} y={-69} width={12} height={27} r={4} color="#C99A2E" />
        <Group origin={vec(-2, -30)} transform={legA}>
          <RoundedRect x={-5} y={-30} width={6} height={30} r={3} color="#EBB892" />
        </Group>
        <Path path="M-9 -46L9 -46L13 -27L-13 -27Z" color="#2F4A7A" />
        <RoundedRect x={-9} y={-68} width={18} height={24} r={5} color="#EEF2F8" />
        <Path path="M-6 -67L-12 -50" style="stroke" strokeWidth={2.5} color="#9C7520" />
        <Group origin={vec(1.5, -64)} transform={armFront}>
          <RoundedRect x={-1} y={-64} width={5} height={22} r={2.5} color="#EBB892" />
        </Group>
        <Circle cx={2} cy={-79} r={11} color="#EBB892" />
        <Path path="M-9 -79Q-10 -92 3 -92Q14 -92 13 -82Q8 -86 2 -85Q-3 -84 -4 -77Z" color="#2B1B14" />
        <Path path="M-17 -81a5 8 0 1 0 10 0a5 8 0 1 0 -10 0" color="#2B1B14" />
        <RoundedRect x={-9} y={-87} width={3} height={5} r={1} color="#E11D2A" />
      </Group>
    </Group>
  );
}

/** Oscurece un color hex (para la pierna de atrás, capuchas, etc.). */
export function shade(hex: string, k = 0.78) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
