import React from 'react';
import { Blur, Circle, Group, LinearGradient, Path, Rect, RoundedRect, vec } from '@shopify/react-native-skia';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { CUTS, cutOpacity } from '../timeline';
import { easeIn, easeOut, prog, win } from '../math';
import { Adult, type Mood } from '../Figures';
import { useInteriorCam } from '../Interiors';
import { Motorcycle } from '../Vehicles';
import { C } from '../theme';

type Num = SharedValue<number>;
type Frame = { W: number; H: number };

const PRODUCTS = ['#E0457B', '#FFB547', '#4FC3F7', '#9BE15D', '#F4F6FA', '#C96F2E'];

/* ---------- 1. Tienda de la esquina ---------- */
function Shop({ clock, frame }: { clock: Num; frame: Frame }) {
  const s = CUTS[0].start;
  const op = useDerivedValue(() => cutOpacity(clock.value, 0));
  const tr = useInteriorCam(clock, 0, frame, [760, 560, 1.05], [880, 560, 1.12]);
  const lt = useDerivedValue(() => clock.value - s);
  const phone = useDerivedValue(() => (lt.value > 0.2 ? 0.6 + 0.4 * Math.sin(lt.value * 18) : 0));
  const go = useDerivedValue(() => easeIn(prog(lt.value, 0.9, 1.7)));
  const x = useDerivedValue(() => 640 + go.value * 640);
  const walk = useDerivedValue<number>(() => (lt.value > 0.9 ? 1 : 0));
  const worry = useDerivedValue(() => prog(lt.value, 0.2, 0.45));
  const focus = useDerivedValue(() => prog(lt.value, 0.8, 1.0));
  const mood: Mood = { worry, focus };
  const ring = useDerivedValue(() => win(lt.value, 0.2, 1.1, 0.1));
  // Levanta el celular por encima del mostrador para leer la alerta
  const lift = useDerivedValue(() => 0.7 * win(lt.value, 0.12, 0.95, 0.15));
  return (
    <Group opacity={op} transform={tr}>
      <Rect x={-600} y={-600} width={2800} height={2200}>
        <LinearGradient start={vec(0, -200)} end={vec(0, 860)} colors={['#2E2433', '#4A3842']} />
      </Rect>
      {/* Repisas con productos */}
      {[300, 420, 540].map((sy, k) => (
        <Group key={sy}>
          {Array.from({ length: 11 }).map((_, j) => (
            <RoundedRect key={j} x={130 + j * 50} y={sy - 50 + ((j + k) % 3) * 8} width={40} height={50 - ((j + k) % 3) * 8} r={4}
              color={PRODUCTS[(j + k * 2) % PRODUCTS.length]} opacity={0.85} />
          ))}
          <Rect x={110} y={sy} width={580} height={12} color="#6E5038" />
        </Group>
      ))}
      {/* Vitrina hacia la calle, con la luz de la mañana */}
      <Rect x={1000} y={200} width={420} height={560}>
        <LinearGradient start={vec(0, 200)} end={vec(0, 760)} colors={['#6C7FC0', '#F2B07E']} />
      </Rect>
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <Rect key={k} x={1000} y={200 + k * 14} width={420} height={6} color="#8A919E" />
      ))}
      <Path path="M1000 200H1420V760H1000ZM1210 300V760" style="stroke" strokeWidth={12} color="#3A2E36" />
      <Path path="M1000 300L1420 300L900 860L520 860Z" color="rgba(255,214,150,0.10)">
        <Blur blur={12} />
      </Path>
      <Rect x={-600} y={860} width={2800} height={800} color="#2A2230" />
      <Adult clock={clock} x={x} y={860} scale={2.7} walk={walk} phone={phone} ring={ring} point={lift} mood={mood} seed={50}
        look={{ body: '#2F7D5B', legs: '#2C2F45', skin: '#C68E62', hair: 'long', hairColor: '#1A120C' }} />
      {/* Mostrador */}
      <Rect x={360} y={640} width={600} height={220} color="#6E5038" />
      <Rect x={350} y={624} width={620} height={20} color="#8C6A4A" />
      <RoundedRect x={420} y={570} width={110} height={56} r={6} color="#2A2F3A" />
      <RoundedRect x={432} y={580} width={60} height={22} r={3} color="#9BE15D" opacity={0.7} />
    </Group>
  );
}

/* ---------- 2. Policía motorizada ---------- */
function Motos({ clock, frame }: { clock: Num; frame: Frame }) {
  const s = CUTS[1].start;
  const op = useDerivedValue(() => cutOpacity(clock.value, 1));
  const tr = useInteriorCam(clock, 1, frame, [760, 600, 1.0], [860, 610, 1.08]);
  const lt = useDerivedValue(() => clock.value - s);
  const go = useDerivedValue(() => easeIn(prog(lt.value, 0.7, 1.5)));
  const goB = useDerivedValue(() => easeIn(prog(lt.value, 0.85, 1.6)));
  const xA = useDerivedValue(() => 520 + go.value * 1700);
  const xB = useDerivedValue(() => 220 + goB.value * 1800);
  const bg = useDerivedValue<Transforms3d>(() => [{ translateX: -go.value * 500 }]);
  const sirens = useDerivedValue(() => (lt.value > 0.3 ? clock.value : 0));
  const wash = useDerivedValue(() => (lt.value > 0.3 ? (Math.floor(lt.value * 7) % 2 === 0 ? 0.2 : 0.05) : 0));
  const washBlue = useDerivedValue(() => (lt.value > 0.3 ? 0.25 - wash.value : 0));
  const streaks = useDerivedValue(() => prog(lt.value, 0.8, 1.0));
  const ring = useDerivedValue(() => win(lt.value, 0.1, 0.95, 0.1));
  return (
    <Group opacity={op} transform={tr}>
      <Rect x={-600} y={-600} width={2800} height={2200}>
        <LinearGradient start={vec(0, -300)} end={vec(0, 820)} colors={['#3A4F8A', '#E2A27E']} />
      </Rect>
      <Group transform={bg}>
        {Array.from({ length: 16 }).map((_, k) => (
          <Rect key={k} x={-500 + k * 210} y={200 + (k % 4) * 60} width={180} height={640} color={k % 2 ? '#5A6A8E' : '#4D5C80'} />
        ))}
        {Array.from({ length: 40 }).map((_, k) => (
          <Rect key={`w${k}`} x={-460 + ((k * 97) % 3200)} y={290 + ((k * 53) % 300)} width={22} height={30} color="#2E3D5C" />
        ))}
      </Group>
      <Rect x={-600} y={820} width={2800} height={800} color="#3A4256" />
      <Rect x={-600} y={812} width={2800} height={10} color="#8A8F9C" />
      <Group opacity={streaks}>
        {[0, 1, 2, 3, 4].map((k) => (
          <RoundedRect key={k} x={-200 + k * 60} y={460 + k * 70} width={420} height={6} r={3} color="rgba(110,168,255,0.6)" />
        ))}
      </Group>
      <Motorcycle clock={sirens} x={xB} y={790} scale={2.5} ring={ring} />
      <Motorcycle clock={sirens} x={xA} y={860} scale={3.1} ring={ring} />
      <Rect x={-600} y={-600} width={2800} height={2200} color={C.sos} opacity={wash} />
      <Rect x={-600} y={-600} width={2800} height={2200} color={C.police} opacity={washBlue} />
    </Group>
  );
}

/* ---------- 3. Familia de Mateo, en el desayuno ---------- */
function Kitchen({ clock, frame }: { clock: Num; frame: Frame }) {
  const s = CUTS[2].start;
  const op = useDerivedValue(() => cutOpacity(clock.value, 2));
  const tr = useInteriorCam(clock, 2, frame, [820, 560, 1.05], [940, 560, 1.12]);
  const lt = useDerivedValue(() => clock.value - s);
  const phone = useDerivedValue(() => (lt.value > 0.15 ? 0.6 + 0.4 * Math.sin(lt.value * 18) : 0));
  const run = useDerivedValue(() => easeIn(prog(lt.value, 0.7, 1.55)));
  const walk = useDerivedValue<number>(() => (lt.value > 0.7 ? 1 : 0));
  const momX = useDerivedValue(() => 700 + run.value * 560);
  const dadX = useDerivedValue(() => 860 + run.value * 480);
  const door = useDerivedValue<Transforms3d>(() => [{ scaleX: 1 - 0.85 * easeOut(prog(lt.value, 0.45, 0.85)) }]);
  const panic = useDerivedValue(() => prog(lt.value, 0.1, 0.35));
  const mood: Mood = { fear: panic, worry: 1 };
  const ring = useDerivedValue(() => win(lt.value, 0.1, 1.2, 0.1));
  return (
    <Group opacity={op} transform={tr}>
      <Rect x={-600} y={-600} width={2800} height={2200}>
        <LinearGradient start={vec(0, -200)} end={vec(0, 860)} colors={['#2F2A45', '#4A3F5E']} />
      </Rect>
      {/* Ventana con el amanecer */}
      <Rect x={-200} y={200} width={560} height={420}>
        <LinearGradient start={vec(0, 200)} end={vec(0, 620)} colors={['#6C7FC0', '#F7B57A']} />
      </Rect>
      <Circle cx={160} cy={560} r={46} color="#FFE4B5" />
      <Path path="M-200 200H360V620H-200ZM80 200V620M-200 410H360" style="stroke" strokeWidth={14} color="#5B4E6E" />
      <Path path="M-200 200L360 200L860 860L-100 860Z" color="rgba(255,200,140,0.10)">
        <Blur blur={14} />
      </Path>
      {/* Reloj: 06:52 */}
      <Circle cx={470} cy={170} r={42} color="#E8ECF5" />
      <Circle cx={470} cy={170} r={42} color="#5B4E6E" style="stroke" strokeWidth={6} />
      <Path path="M470 170L461.2 188M470 170L447.7 149.9" style="stroke" strokeWidth={5} strokeCap="round" color="#1B2340" />
      {/* Muebles de cocina */}
      <Rect x={560} y={210} width={520} height={130} color="#5E7A8C" />
      <Path path="M690 210V340M820 210V340M950 210V340" style="stroke" strokeWidth={4} color="#4A6274" />
      <Rect x={560} y={560} width={520} height={300} color="#5E7A8C" />
      <Rect x={550} y={546} width={540} height={18} color="#D9D2C5" />
      {/* Puerta de salida */}
      <Rect x={1150} y={330} width={220} height={530} color="#3A3352" />
      <Rect x={1150} y={330} width={220} height={530}>
        <LinearGradient start={vec(0, 330)} end={vec(0, 860)} colors={['#F2B07E', '#8E9CC8']} />
      </Rect>
      <Group origin={vec(1370, 600)} transform={door}>
        <Rect x={1150} y={330} width={220} height={530} color="#7A5A44" />
        <Circle cx={1180} cy={600} r={9} color="#C9A35A" />
      </Group>
      <Rect x={-600} y={860} width={2800} height={800} color="#2A2440" />
      <Adult clock={clock} x={momX} y={860} scale={2.7} walk={walk} phone={phone} ring={ring} mood={mood} seed={51}
        look={{ body: '#B4533C', legs: '#2C2F45', skin: '#D9A47C', hair: 'long', hairColor: '#2B1B14' }} />
      <Adult clock={clock} x={dadX} y={860} scale={2.7} walk={walk} phone={phone} ring={ring} mood={mood} seed={52}
        look={{ body: '#3F6E5A', legs: '#26365A', skin: '#C68E62', hair: 'short' }} />
      {/* Mesa del desayuno */}
      <RoundedRect x={520} y={690} width={420} height={16} r={6} color="#A07A55" />
      <Rect x={540} y={706} width={14} height={154} color="#7A5A44" />
      <Rect x={906} y={706} width={14} height={154} color="#7A5A44" />
      <RoundedRect x={590} y={662} width={26} height={28} r={4} color="#F4F6FA" />
      <RoundedRect x={860} y={662} width={26} height={28} r={4} color="#E0457B" />
      <Path path="M690 690a46 14 0 0 1 92 0Z" color="#F4F6FA" />
      <RoundedRect x={712} y={668} width={46} height={16} r={8} color="#E8C27A" />
    </Group>
  );
}

export function BusInteriors({ clock, W, H }: { clock: Num; W: number; H: number }) {
  const frame = { W, H };
  return (
    <>
      <Shop clock={clock} frame={frame} />
      <Motos clock={clock} frame={frame} />
      <Kitchen clock={clock} frame={frame} />
    </>
  );
}
