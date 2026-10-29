import React from 'react';
import { BlurMask, Circle, Group, Path, RoundedRect, Skia, vec } from '@shopify/react-native-skia';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

type Num = SharedValue<number>;

const TORSO = 'M-17 -58V-118Q-17 -134 0 -134Q17 -134 17 -118V-58Z';
const TORSO_SHADE = 'M5 -58V-133.5Q17 -131 17 -118V-58Z';
const HAIR_LONG = 'M-14 -150Q-14 -166 0 -166Q14 -166 14 -150L17 -120L-17 -120Z';
const HAIR_SHORT = 'M-13 -156Q-12 -168 0 -168Q13 -168 13 -156Q6 -161 0 -160Q-7 -160 -13 -156Z';
const HOOD = 'M-16 -146Q-16 -168 0 -168Q16 -168 16 -146L16 -134L-16 -134Z';

export type Look = {
  body: string;
  legs: string;
  skin: string;
  hair?: 'short' | 'long' | 'cap' | 'hood' | 'none' | 'bun' | 'helmet';
  hairColor?: string;
  stripes?: boolean;
  officer?: boolean;
  tie?: boolean; // uniforme escolar
  apron?: boolean;
};

/** Emociones de un rostro. Cada una va de 0 a 1 y se pueden mezclar. */
export type Mood = {
  fear?: Num | number;  // ojos muy abiertos, pupilas chicas, cejas arriba, boca abierta
  worry?: Num | number; // cejas inclinadas, boca hacia abajo
  joy?: Num | number;   // sonrisa, ojos entrecerrados, mejillas
  sleep?: Num | number; // ojos cerrados
  focus?: Num | number; // ceño fruncido, mirada firme
  tears?: Num | number;
};

function read(v: Num | number | undefined) {
  'worklet';
  return v === undefined ? 0 : typeof v === 'number' ? v : v.value;
}

type FaceProps = {
  clock: Num;
  cx: number;
  cy: number;
  r: number;
  skin: string;
  mood?: Mood;
  /** De perfil mirando a la derecha (un ojo); si no, de frente. */
  profile?: boolean;
  /** Desfasa el parpadeo para que no parpadeen todos a la vez. */
  seed?: number;
  brow?: string;
};

const NO_MOOD: Mood = {};

/** Rostro dibujado sobre una cabeza circular de radio r. */
export function Face({ clock, cx, cy, r, skin, mood = NO_MOOD, profile = false, seed = 0, brow = '#2B1B14' }: FaceProps) {
  const u = r / 13;
  const eyes = profile ? [cx + 0.5 * r] : [cx - 0.36 * r, cx + 0.36 * r];
  const ey = cy - 0.02 * r;
  const ew = (profile ? 2.8 : 3.6) * u;
  const mx = profile ? cx + 0.62 * r : cx;
  const my = cy + 0.46 * r;
  const lid = shade(skin, 0.45);

  const m = useDerivedValue(() => {
    const t = clock.value;
    const blink = (t + seed * 1.37) % 3.4 < 0.12 ? 1 : 0;
    const fear = read(mood.fear);
    const joy = read(mood.joy);
    const sleep = read(mood.sleep);
    return {
      fear,
      joy,
      worry: read(mood.worry),
      focus: read(mood.focus),
      sleep,
      open: Math.max(0, 1 - sleep - blink),
      tears: read(mood.tears),
    };
  });

  const eyeH = useDerivedValue(() => 3.4 * u * (1 + 0.5 * m.value.fear - 0.3 * m.value.focus - 0.35 * m.value.joy) * m.value.open);
  const sclera = useDerivedValue(() => {
    const p = Skia.PathBuilder.Make();
    const h = eyeH.value;
    if (h > 0.4 * u) for (const x of eyes) p.addOval(Skia.XYWHRect(x - ew / 2, ey - h / 2, ew, h));
    return p.detach();
  });
  const pupils = useDerivedValue(() => {
    const p = Skia.PathBuilder.Make();
    const h = eyeH.value;
    const pr = Math.min(h / 2, 1.35 * u * (1 - 0.4 * m.value.fear));
    if (h > 0.4 * u) for (const x of eyes) p.addCircle(x + (profile ? 0.5 * u : 0), ey + 0.15 * u, pr);
    return p.detach();
  });
  // Línea del párpado: pestaña arriba cuando está abierto, arco cuando está cerrado
  const lids = useDerivedValue(() => {
    const p = Skia.PathBuilder.Make();
    const h = eyeH.value;
    for (const x of eyes) {
      if (h > 0.4 * u) {
        p.moveTo(x - ew / 2 - 0.3 * u, ey - h / 2 + 0.3 * u);
        p.quadTo(x, ey - h / 2 - 0.7 * u, x + ew / 2 + 0.3 * u, ey - h / 2 + 0.3 * u);
      } else {
        const bend = m.value.joy > 0.5 ? -1.2 : 1.1; // feliz: arco hacia arriba; dormido: hacia abajo
        p.moveTo(x - ew / 2, ey);
        p.quadTo(x, ey + bend * u, x + ew / 2, ey);
      }
    }
    return p.detach();
  });
  const brows = useDerivedValue(() => {
    const { fear, worry, focus, joy } = m.value;
    const p = Skia.PathBuilder.Make();
    const by = ey - 3.9 * u - 1.6 * u * fear - 0.5 * u * worry - 0.5 * u * joy + 0.7 * u * focus;
    const innerLift = (1.7 * fear + 1.6 * worry - 1.8 * focus) * u;
    for (const x of eyes) {
      const dir = profile ? 1 : x < cx ? 1 : -1; // hacia el centro de la cara
      const inner = x + dir * ew * 0.65;
      const outer = x - dir * ew * 0.65;
      p.moveTo(outer, by + 0.3 * u);
      p.quadTo(x, by - 0.9 * u * (1 + 0.5 * joy), inner, by - innerLift);
    }
    return p.detach();
  });
  const mouth = useDerivedValue(() => {
    const { fear, joy, worry, focus } = m.value;
    const p = Skia.PathBuilder.Make();
    const w = (profile ? 2.6 : 5.4) * u * (1 + 0.25 * joy - 0.25 * fear);
    const smile = joy - 0.6 * fear - 0.5 * worry - 0.15 * focus;
    const open = (0.95 * fear + 0.4 * joy) * 3.1 * u;
    const cy0 = my - smile * 1.5 * u;
    p.moveTo(mx - w / 2, cy0);
    p.quadTo(mx, my + smile * 0.6 * u - open * 0.25, mx + w / 2, cy0);
    p.quadTo(mx, my + smile * 1.8 * u + open, mx - w / 2, cy0);
    p.close();
    return p.detach();
  });
  const blush = useDerivedValue(() => 0.16 + 0.3 * m.value.joy);
  const lidOp = useDerivedValue(() => (eyeH.value > 0.4 * u ? 0.85 : 1));
  const tearT = useDerivedValue(() => (clock.value * 0.9 + seed) % 1);
  const tearY = useDerivedValue(() => ey + 2 * u + tearT.value * 0.55 * r);
  const tearOp = useDerivedValue(() => m.value.tears * (1 - tearT.value));
  const tearX = eyes[eyes.length - 1] + (profile ? -0.2 * u : 0.6 * u);

  return (
    <Group>
      {profile ? (
        <Circle cx={cx + 0.96 * r} cy={cy + 0.1 * r} r={0.17 * r} color={skin} />
      ) : (
        <Path
          path={`M${cx - 0.7 * u} ${cy + 0.17 * r}Q${cx} ${cy + 0.27 * r} ${cx + 0.7 * u} ${cy + 0.17 * r}`}
          style="stroke" strokeWidth={0.9 * u} strokeCap="round" color={shade(skin, 0.68)}
        />
      )}
      {(profile ? [cx + 0.32 * r] : [cx - 0.56 * r, cx + 0.56 * r]).map((bx) => (
        <Circle key={bx} cx={bx} cy={cy + 0.3 * r} r={0.17 * r} color="#FF6F86" opacity={blush} />
      ))}
      <Path path={sclera} color="#F6F2EC" />
      <Path path={pupils} color="#1B1311" />
      <Path path={lids} style="stroke" strokeWidth={0.95 * u} strokeCap="round" color={lid} opacity={lidOp} />
      <Path path={brows} style="stroke" strokeWidth={1.35 * u} strokeCap="round" color={brow} />
      <Path path={mouth} color="#5A1F2B" />
      <Path path={mouth} style="stroke" strokeWidth={1.05 * u} strokeJoin="round" color="#5A1F2B" />
      <Circle cx={tearX} cy={tearY} r={0.75 * u} color="#BFE3FF" opacity={tearOp} />
    </Group>
  );
}

/** Celular sonando: ondas que salen del teléfono y marcas de vibración a los lados. `ring` va de 0 a 1. */
export function PhoneRing({ clock, cx, cy, r, ring }: { clock: Num; cx: number; cy: number; r: number; ring: Num }) {
  const w0 = useDerivedValue(() => (clock.value * 1.8) % 1);
  const w1 = useDerivedValue(() => (clock.value * 1.8 + 0.5) % 1);
  const r0 = useDerivedValue(() => r * (1 + 2.4 * w0.value));
  const r1 = useDerivedValue(() => r * (1 + 2.4 * w1.value));
  const o0 = useDerivedValue(() => ring.value * (1 - w0.value));
  const o1 = useDerivedValue(() => ring.value * (1 - w1.value));
  const buzz = useDerivedValue(() => ring.value * (Math.floor(clock.value * 12) % 2 === 0 ? 1 : 0.3));
  const arc = (side: number, k: number) =>
    `M${cx + side * r * k} ${cy - r * 0.45 * k}q${side * r * 0.35 * k} ${r * 0.45 * k} 0 ${r * 0.9 * k}`;
  const marks = arc(-1, 1.4) + arc(-1, 1.95) + arc(1, 1.4) + arc(1, 1.95);
  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r0} style="stroke" strokeWidth={r * 0.2} color="#FF5A64" opacity={o0} />
      <Circle cx={cx} cy={cy} r={r1} style="stroke" strokeWidth={r * 0.2} color="#FF5A64" opacity={o1} />
      <Path path={marks} style="stroke" strokeWidth={r * 0.17} strokeCap="round" color="#FFFFFF" opacity={buzz} />
    </Group>
  );
}

/** Sombra lateral de la cabeza, para que tenga volumen. `side` 1 = derecha, -1 = izquierda. */
function HeadShade({ cx, cy, r, side = 1 }: { cx: number; cy: number; r: number; side?: number }) {
  const clip = Skia.RRectXY(Skia.XYWHRect(cx - r, cy - r, 2 * r, 2 * r), r, r);
  return (
    <Group clip={clip}>
      <Circle cx={cx + side * 0.8 * r} cy={cy + 0.15 * r} r={r} color="rgba(40,14,24,0.2)">
        <BlurMask blur={r * 0.3} style="normal" />
      </Circle>
    </Group>
  );
}

type AdultProps = {
  clock: Num;
  x: Num;
  y: number | Num;
  look: Look;
  scale?: number;
  flip?: boolean; // mira al otro lado: el brazo derecho apunta a la izquierda
  walk?: Num;    // 0 quieto, 1 caminando o corriendo
  armsUp?: Num;  // 0 brazos abajo, 1 manos arriba
  phone?: Num;   // brillo del celular en la mano (0..1)
  ring?: Num;    // 0..1, el celular suena: pantalla roja, ondas y vibración
  opacity?: Num | number;
  mood?: Mood;
  seed?: number;
  point?: Num;   // 0..1, levanta solo el brazo derecho (amenazar, agarrar)
  holding?: 'knife' | 'gun';
};

/** Persona adulta en silueta ilustrada. Origen en los pies. */
export function Adult({ clock, x, y, look, scale = 1, flip = false, walk, armsUp, phone, ring, opacity = 1, mood, seed = 0, point, holding }: AdultProps) {
  const tr = useDerivedValue<Transforms3d>(() => [{ translateX: x.value }, { translateY: read(y) }, { scaleX: flip ? -scale : scale }, { scaleY: scale }]);
  const swing = useDerivedValue(() => (walk ? walk.value : 0) * Math.sin(clock.value * 15) * 0.55);
  const legA = useDerivedValue<Transforms3d>(() => [{ rotate: swing.value }]);
  const legB = useDerivedValue<Transforms3d>(() => [{ rotate: -swing.value }]);
  const up = useDerivedValue(() => (armsUp ? armsUp.value : 0) * (Math.PI - 0.3));
  const armL = useDerivedValue<Transforms3d>(() => [{ rotate: up.value - swing.value * 0.7 }]);
  const armR = useDerivedValue<Transforms3d>(() => [{ rotate: -up.value - (point ? point.value : 0) * 1.35 + swing.value * 0.7 }]);
  const glow = useDerivedValue(() => (phone ? phone.value : 0));

  const legBack = shade(look.legs);
  const headY = look.hair === 'hood' ? -148 : -149;
  const headR = look.hair === 'hood' ? 10.5 : 13;
  return (
    <Group transform={tr} opacity={opacity}>
      <Group origin={vec(5, -62)} transform={legB}>
        <RoundedRect x={1} y={-62} width={8} height={62} r={3} color={legBack} />
      </Group>
      <Group origin={vec(-5, -62)} transform={legA}>
        <RoundedRect x={-9} y={-62} width={8} height={62} r={3} color={look.legs} />
      </Group>
      {look.hair === 'long' && <Path path={HAIR_LONG} color={look.hairColor ?? '#2B1B14'} />}
      {look.hair === 'bun' && <Circle cx={0} cy={-165} r={7.5} color={look.hairColor ?? '#2B1B14'} />}
      {look.hair === 'hood' && <Path path={HOOD} color={shade(look.body)} />}
      <RoundedRect x={-4.5} y={-142} width={9} height={10} r={3} color={shade(look.skin, 0.85)} />
      <Path path={TORSO} color={look.body} />
      <Path path={TORSO_SHADE} color="rgba(4,10,30,0.16)">
        <BlurMask blur={3} style="normal" />
      </Path>
      {look.stripes && (
        <Path path="M-17 -102H17M-17 -86H17M-17 -70H17" style="stroke" strokeWidth={3} color="#7FA6D3" />
      )}
      {look.apron && (
        <>
          <Path path="M-6 -133L-10 -112M6 -133L10 -112" style="stroke" strokeWidth={2} color="#F1E6D2" />
          <RoundedRect x={-12} y={-114} width={24} height={52} r={4} color="#F1E6D2" />
          <RoundedRect x={-7} y={-96} width={14} height={9} r={2} color="#E3D3B8" />
        </>
      )}
      {look.tie && (
        <>
          <Path path="M-7 -134L0 -124L7 -134Z" color="#F4F6FA" />
          <Path path="M-2.5 -126H2.5L4 -104L0 -99L-4 -104Z" color="#C8202C" />
        </>
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
        {holding === 'knife' && (
          <>
            <RoundedRect x={17} y={-84} width={7} height={11} r={2} color="#2A1D16" />
            <Path path="M17.5 -73H23.5L21.5 -46L20.5 -44Z" color="#DDE3EC" />
            <Path path="M20.5 -73V-47" style="stroke" strokeWidth={0.8} color="#9AA6B8" />
          </>
        )}
        {holding === 'gun' && (
          <>
            <RoundedRect x={16.5} y={-82} width={8} height={26} r={1.5} color="#0B0D12" />
            <RoundedRect x={16.5} y={-82} width={8} height={26} r={1.5} color="#B4BDCE" style="stroke" strokeWidth={1.1} />
            <RoundedRect x={24} y={-82} width={10} height={7} r={1.5} color="#0B0D12" />
          </>
        )}
        {phone && (
          <Group opacity={glow}>
            <Circle cx={22} cy={-78} r={14} color="rgba(230,243,255,0.7)">
              <BlurMask blur={9} style="normal" />
            </Circle>
            <RoundedRect x={18} y={-86} width={8} height={13} r={1.5} color="#EAF5FF" />
          </Group>
        )}
        {ring && (
          <>
            <RoundedRect x={18} y={-86} width={8} height={13} r={1.5} color="#FF5A64" opacity={ring} />
            <RoundedRect x={19.5} y={-84} width={5} height={2.5} r={1} color="#FFFFFF" opacity={ring} />
            <PhoneRing clock={clock} cx={22} cy={-79.5} r={8} ring={ring} />
          </>
        )}
      </Group>
      <Circle cx={0} cy={headY} r={headR} color={look.skin} />
      <HeadShade cx={0} cy={headY} r={headR} />
      {(look.hair === 'short' || look.hair === 'bun') && <Path path={HAIR_SHORT} color={look.hairColor ?? '#20160F'} />}
      {look.hair === 'helmet' && (
        <>
          <Path path="M-16.5 -146Q-17 -170 0 -170Q17 -170 16.5 -146H11.5Q12 -159 0 -159Q-12 -159 -11.5 -146Z" color={look.hairColor ?? '#14171E'} />
          <RoundedRect x={-13} y={-166} width={26} height={5} r={2} color="#3A4A6A" />
        </>
      )}
      {look.hair === 'long' && (
        <Path path="M-13 -152Q-12 -165 0 -165Q13 -165 13 -152Q6 -158 0 -157Q-7 -157 -13 -152Z" color={look.hairColor ?? '#2B1B14'} />
      )}
      {(look.hair === 'cap' || look.officer) && (
        <>
          <RoundedRect x={-14} y={-166} width={28} height={11} r={3} color="#0F1A33" />
          <RoundedRect x={-2} y={-158} width={20} height={3} r={1} color="#0F1A33" />
        </>
      )}
      <Face clock={clock} cx={0} cy={headY + 1} r={headR} skin={look.skin} mood={mood} seed={seed} brow={look.hairColor ?? '#20160F'} />
    </Group>
  );
}

type GirlProps = { clock: Num; x: Num; walk: Num; fear: Num; mood: Mood };

/** Valentina. Mira hacia la derecha. Origen en los pies. */
export function Girl({ clock, x, walk, fear, mood }: GirlProps) {
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
        <RoundedRect x={-1.5} y={-71} width={7} height={5} r={2} color="#D9A47C" />
        <Circle cx={2} cy={-79} r={11} color="#EBB892" />
        <HeadShade cx={2} cy={-79} r={11} side={-1} />
        <Path path="M-9 -79Q-10 -92 3 -92Q14 -92 13 -82Q8 -86 2 -85Q-3 -84 -4 -77Z" color="#2B1B14" />
        <Face clock={clock} cx={2.5} cy={-78} r={11} skin="#EBB892" mood={mood} profile seed={0.4} />
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
