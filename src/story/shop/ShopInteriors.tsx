import React from 'react';
import { Blur, BlurMask, Circle, Group, LinearGradient, Path, Rect, RoundedRect, vec } from '@shopify/react-native-skia';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { CUTS, cutOpacity } from '../timeline';
import { easeIn, easeOut, prog, win } from '../math';
import { Adult, PhoneRing, type Look, type Mood } from '../Figures';
import { useInteriorCam } from '../Interiors';
import { C } from '../theme';

type Num = SharedValue<number>;
type Frame = { W: number; H: number };

const MECHANIC: Look = { body: '#2F5D8C', legs: '#26365A', skin: '#B9825B', hair: 'cap' };
const DAUGHTER: Look = { body: '#7E5BA6', legs: '#2C2F45', skin: '#C68E62', hair: 'long', hairColor: '#2B1B14' };
const DISPATCHER: Look = { body: '#1E3A7A', legs: '#14213F', skin: '#E2B08A', officer: true };
const BOTTLES = ['#E0457B', '#FFB547', '#4FC3F7', '#9BE15D', '#F4F6FA', '#8E6BD8'];

/* ---------- 1. Vecino del taller ---------- */
function Workshop({ clock, frame }: { clock: Num; frame: Frame }) {
  const s = CUTS[0].start;
  const op = useDerivedValue(() => cutOpacity(clock.value, 0));
  const tr = useInteriorCam(clock, 0, frame, [760, 560, 1.05], [880, 560, 1.12]);
  const lt = useDerivedValue(() => clock.value - s);
  const phone = useDerivedValue(() => (lt.value > 0.2 ? 0.6 + 0.4 * Math.sin(lt.value * 18) : 0));
  const ring = useDerivedValue(() => win(lt.value, 0.2, 1.1, 0.1));
  const lift = useDerivedValue(() => 0.7 * win(lt.value, 0.12, 0.95, 0.15));
  const go = useDerivedValue(() => easeIn(prog(lt.value, 0.9, 1.7)));
  const x = useDerivedValue(() => 560 + go.value * 720);
  const walk = useDerivedValue<number>(() => (lt.value > 0.9 ? 1 : 0));
  const worry = useDerivedValue(() => prog(lt.value, 0.2, 0.45));
  const focus = useDerivedValue(() => prog(lt.value, 0.8, 1.0));
  const mood: Mood = { worry, focus };
  return (
    <Group opacity={op} transform={tr}>
      <Rect x={-600} y={-600} width={2800} height={2200}>
        <LinearGradient start={vec(0, -200)} end={vec(0, 860)} colors={['#262B38', '#3E4452']} />
      </Rect>
      {/* Tablero de herramientas */}
      <Rect x={100} y={210} width={560} height={270} color="#8A6E4B" />
      <Path path="M150 250v90M146 250h8M220 250l30 80M300 250v110M290 250h20v20h-20M380 250q20 0 20 20v80M460 260h70M470 250v20M560 250v100M550 350h20"
        style="stroke" strokeWidth={8} strokeCap="round" color="#C9D2E3" />
      {/* Llantas */}
      {[0, 1, 2].map((k) => (
        <Group key={k}>
          <RoundedRect x={760} y={760 - k * 46} width={150} height={44} r={14} color="#14171E" />
          <RoundedRect x={800} y={772 - k * 46} width={70} height={20} r={8} color="#3A3F4B" />
        </Group>
      ))}
      {/* Portón abierto hacia la calle */}
      <Rect x={1000} y={240} width={460} height={620}>
        <LinearGradient start={vec(0, 240)} end={vec(0, 860)} colors={['#6B4F8A', '#F29A5C']} />
      </Rect>
      {[0, 1, 2, 3, 4].map((k) => (
        <Rect key={k} x={1000} y={240 + k * 14} width={460} height={8} color="#8A919E" />
      ))}
      <Path path="M1000 300L1460 300L1100 860L700 860Z" color="rgba(255,190,120,0.10)">
        <Blur blur={12} />
      </Path>
      <Rect x={-600} y={860} width={2800} height={800} color="#23262F" />
      <Adult clock={clock} x={x} y={860} scale={2.7} walk={walk} phone={phone} ring={ring} point={lift} mood={mood} seed={90} look={MECHANIC} />
      {/* Banco de trabajo */}
      <Rect x={90} y={640} width={560} height={20} color="#7A5A44" />
      <Rect x={110} y={660} width={16} height={200} color="#5E4434" />
      <Rect x={614} y={660} width={16} height={200} color="#5E4434" />
      <RoundedRect x={150} y={586} width={120} height={54} r={6} color="#C8202C" />
      <Rect x={190} y={576} width={40} height={10} color="#8C1C24" />
      <RoundedRect x={400} y={600} width={70} height={40} r={4} color="#5A6070" />
    </Group>
  );
}

/* ---------- 2. Central de policía: ven el video en vivo ---------- */
function Dispatch({ clock, frame }: { clock: Num; frame: Frame }) {
  const s = CUTS[1].start;
  const op = useDerivedValue(() => cutOpacity(clock.value, 1));
  const tr = useInteriorCam(clock, 1, frame, [800, 560, 1.0], [860, 560, 1.08]);
  const lt = useDerivedValue(() => clock.value - s);
  const ring = useDerivedValue(() => win(lt.value, 0.1, 0.95, 0.1));
  const live = useDerivedValue(() => (Math.floor(clock.value * 3) % 2 === 0 ? 1 : 0.35));
  const box = useDerivedValue(() => (Math.floor(clock.value * 4) % 2 === 0 ? '#FF4D57' : '#FFD0D3'));
  const x = useDerivedValue<number>(() => 920);
  const point = useDerivedValue(() => 0.75 * prog(lt.value, 0.75, 0.95));
  const mood: Mood = { focus: 1 };
  const radio = useDerivedValue(() => (lt.value > 0.8 ? 0.6 + 0.4 * Math.sin(lt.value * 20) : 0));
  return (
    <Group opacity={op} transform={tr}>
      <Rect x={-600} y={-600} width={2800} height={2200}>
        <LinearGradient start={vec(0, -200)} end={vec(0, 860)} colors={['#070D1E', '#121C38']} />
      </Rect>
      {/* Pared de monitores */}
      {[0, 1].map((r) =>
        [2, 3].map((c) => (
          <Group key={`${r}${c}`}>
            <Rect x={300 + c * 250} y={160 + r * 190} width={230} height={170} color="#13264A" />
            <Path path={`M${320 + c * 250} ${200 + r * 190}h120M${320 + c * 250} ${220 + r * 190}h80M${320 + c * 250} ${240 + r * 190}h150`}
              style="stroke" strokeWidth={6} color="rgba(108,196,255,0.25)" />
          </Group>
        )),
      )}
      {/* Pantalla grande: la tienda en vivo */}
      <Rect x={300} y={160} width={480} height={360} color="#0B1631" />
      <Rect x={316} y={176} width={448} height={328}>
        <LinearGradient start={vec(0, 176)} end={vec(0, 504)} colors={['#6B4F8A', '#C9707A']} />
      </Rect>
      <Rect x={380} y={250} width={320} height={254} color="#E6B85C" />
      <Rect x={400} y={300} width={280} height={18} color="#C8202C" />
      <Rect x={410} y={330} width={260} height={174} color="#4E3A2C" />
      <Circle cx={540} cy={370} r={13} color="#C68E62" />
      <Rect x={470} y={430} width={140} height={74} color="#6E5038" />
      <Circle cx={470} cy={400} r={14} color="#14171E" />
      <Rect x={456} y={414} width={28} height={50} color="#3A3F4B" />
      <Circle cx={620} cy={400} r={14} color="#8C1C24" />
      <Rect x={606} y={414} width={28} height={50} color="#4A2F2F" />
      <Path path="M440 360v-20h20M600 340h20v20M620 470v20h-20M460 490h-20v-20" style="stroke" strokeWidth={5} color={box} />
      <Circle cx={340} cy={198} r={8} color={C.sos} opacity={live} />
      <RoundedRect x={354} y={190} width={56} height={16} r={3} color="rgba(225,29,42,0.85)" opacity={live} />
      <Circle cx={540} cy={340} r={260} color="rgba(108,196,255,0.10)">
        <BlurMask blur={60} style="normal" />
      </Circle>
      <Rect x={-600} y={860} width={2800} height={800} color="#0B1226" />
      <Adult clock={clock} x={x} y={800} scale={2.4} flip look={DISPATCHER} point={point} mood={mood} seed={91} />
      {/* Escritorio, teléfono y radio */}
      <Rect x={250} y={640} width={1100} height={28} color="#2A3456" />
      <Rect x={270} y={668} width={1060} height={192} color="#1B2340" />
      <RoundedRect x={700} y={612} width={200} height={28} r={4} color="#0B1631" />
      <RoundedRect x={1110} y={596} width={90} height={44} r={8} color="#2F3A5E" />
      <RoundedRect x={1124} y={586} width={62} height={16} r={6} color="#14171E" />
      <RoundedRect x={1140} y={606} width={30} height={16} r={2} color="#FF5A64" opacity={ring} />
      <PhoneRing clock={clock} cx={1155} cy={610} r={26} ring={ring} />
      <RoundedRect x={1230} y={560} width={40} height={80} r={6} color="#14171E" />
      <Path path="M1240 560V500" style="stroke" strokeWidth={5} strokeCap="round" color="#14171E" />
      <Circle cx={1250} cy={590} r={8} color="#22C55E" opacity={radio} />
    </Group>
  );
}

/* ---------- 3. Hija de Doña Rosa, en su peluquería ---------- */
function Salon({ clock, frame }: { clock: Num; frame: Frame }) {
  const s = CUTS[2].start;
  const op = useDerivedValue(() => cutOpacity(clock.value, 2));
  const tr = useInteriorCam(clock, 2, frame, [820, 560, 1.05], [940, 560, 1.12]);
  const lt = useDerivedValue(() => clock.value - s);
  const phone = useDerivedValue(() => (lt.value > 0.15 ? 0.6 + 0.4 * Math.sin(lt.value * 18) : 0));
  const ring = useDerivedValue(() => win(lt.value, 0.1, 1.2, 0.1));
  const lift = useDerivedValue(() => 0.7 * win(lt.value, 0.1, 0.7, 0.12));
  const run = useDerivedValue(() => easeIn(prog(lt.value, 0.7, 1.55)));
  const walk = useDerivedValue<number>(() => (lt.value > 0.7 ? 1 : 0));
  const x = useDerivedValue(() => 760 + run.value * 560);
  const clientX = useDerivedValue<number>(() => 385);
  const door = useDerivedValue<Transforms3d>(() => [{ scaleX: 1 - 0.85 * easeOut(prog(lt.value, 0.45, 0.85)) }]);
  const panic = useDerivedValue(() => prog(lt.value, 0.1, 0.35));
  const mood: Mood = { fear: panic, worry: 1 };
  const clientWorry = useDerivedValue(() => prog(lt.value, 0.5, 0.9));
  return (
    <Group opacity={op} transform={tr}>
      <Rect x={-600} y={-600} width={2800} height={2200}>
        <LinearGradient start={vec(0, -200)} end={vec(0, 860)} colors={['#3E2740', '#5E3A55']} />
      </Rect>
      {/* Espejo */}
      <Rect x={190} y={210} width={380} height={360} color="#C9A35A" />
      <Rect x={202} y={222} width={356} height={336}>
        <LinearGradient start={vec(202, 222)} end={vec(558, 558)} colors={['#9FB4D8', '#5E6F92']} />
      </Rect>
      <Path path="M260 222l60 0l-120 336l-60 0Z" color="rgba(255,255,255,0.15)" />
      {/* Repisa con productos */}
      <Rect x={640} y={330} width={300} height={12} color="#C9A35A" />
      {BOTTLES.map((b, k) => (
        <RoundedRect key={k} x={656 + k * 46} y={282 + (k % 2) * 10} width={26} height={48 - (k % 2) * 10} r={6} color={b} opacity={0.9} />
      ))}
      {/* Puerta */}
      <Rect x={1150} y={330} width={220} height={530}>
        <LinearGradient start={vec(0, 330)} end={vec(0, 860)} colors={['#6B4F8A', '#F29A5C']} />
      </Rect>
      <Group origin={vec(1370, 600)} transform={door}>
        <Rect x={1150} y={330} width={220} height={530} color="rgba(220,235,255,0.35)" />
        <Rect x={1150} y={330} width={220} height={530} color="#C9A35A" style="stroke" strokeWidth={10} />
      </Group>
      <Rect x={-600} y={860} width={2800} height={800} color="#2E1F30" />
      {/* Clienta en el sillón, con capa */}
      <Adult clock={clock} x={clientX} y={830} scale={2.5} look={{ body: '#E8ECF5', legs: '#2C2F45', skin: '#F0C9A6', hair: 'short', hairColor: '#6B4A2E' }}
        mood={{ worry: clientWorry }} seed={92} />
      <RoundedRect x={290} y={690} width={190} height={60} r={14} color="#1B1D26" />
      <Rect x={375} y={750} width={20} height={90} color="#5A6070" />
      <RoundedRect x={320} y={836} width={130} height={20} r={8} color="#5A6070" />
      <Adult clock={clock} x={x} y={860} scale={2.7} walk={walk} phone={phone} ring={ring} point={lift} mood={mood} seed={93} look={DAUGHTER} />
    </Group>
  );
}

export function ShopInteriors({ clock, W, H }: { clock: Num; W: number; H: number }) {
  const frame = { W, H };
  return (
    <>
      <Workshop clock={clock} frame={frame} />
      <Dispatch clock={clock} frame={frame} />
      <Salon clock={clock} frame={frame} />
    </>
  );
}
