import React from 'react';
import { Blur, BlurMask, Circle, Group, LinearGradient, Oval, Path, Rect, RoundedRect, vec } from '@shopify/react-native-skia';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { CUTS, cutOpacity } from './timeline';
import { easeIn, easeInOut, easeOut, mix, prog } from './math';
import { Adult } from './Figures';
import { PoliceCar } from './Vehicles';
import { C } from './theme';

type Num = SharedValue<number>;
type Frame = { W: number; H: number };

/** Cámara de cada interior: un lento acercamiento entre dos encuadres. */
function useInteriorCam(clock: Num, i: number, { W, H }: Frame, from: number[], to: number[]) {
  const start = CUTS[i].start;
  const dur = CUTS[i].end - start;
  return useDerivedValue<Transforms3d>(() => {
    const p = easeInOut(prog(clock.value, start, start + dur));
    const x = mix(from[0], to[0], p);
    const y = mix(from[1], to[1], p);
    // En vertical se abre un poco el encuadre para que entren el velador, la patrulla y la puerta
    const s = Math.max(W / 1600, H / 1250) * mix(from[2], to[2], p) * (H > W ? 0.72 : 1);
    const fx = W > H ? W * 0.6 : W * 0.5;
    const fy = W > H ? H * 0.46 : H * 0.38;
    return [{ translateX: fx - x * s }, { translateY: fy - y * s }, { scale: s }];
  }, [W, H]);
}

/* ---------- 1. Vecino del 4B, dormido ---------- */
function Apartment({ clock, frame }: { clock: Num; frame: Frame }) {
  const s = CUTS[0].start;
  const op = useDerivedValue(() => cutOpacity(clock.value, 0));
  const tr = useInteriorCam(clock, 0, frame, [330, 600, 1.55], [560, 520, 1.25]);
  const lt = useDerivedValue(() => clock.value - s);
  const ring = useDerivedValue(() => (lt.value > 0.2 ? 0.55 + 0.45 * Math.sin(lt.value * 18) : 0));
  const buzz = useDerivedValue<Transforms3d>(() => [
    { translateX: lt.value > 0.2 && lt.value < 1.2 ? Math.sin(lt.value * 95) * 4 : 0 },
  ]);
  const sit = useDerivedValue<Transforms3d>(() => [{ rotate: -Math.PI / 2 * (1 - easeOut(prog(lt.value, 0.85, 1.3))) }]);
  const lamp = useDerivedValue(() => prog(lt.value, 1.3, 1.45));
  const warm = useDerivedValue(() => lamp.value * 0.12);

  return (
    <Group opacity={op} transform={tr}>
      <Rect x={-600} y={-600} width={2800} height={2200} color="#0A1230" />
      <Rect x={-600} y={-600} width={2800} height={1360}>
        <LinearGradient start={vec(0, -100)} end={vec(0, 760)} colors={['#070D24', '#111C40']} />
      </Rect>
      {/* Ventana con la ciudad de noche */}
      <Rect x={1060} y={170} width={300} height={250} color="#0B1840" />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <Rect key={k} x={1080 + k * 46} y={300 - (k % 3) * 30} width={30} height={140} color="#13244D" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Rect key={`w${k}`} x={1090 + (k * 37) % 270} y={320 + (k % 4) * 22} width={6} height={9} color="#FFD27A" />
      ))}
      <Circle cx={1300} cy={220} r={20} color="#E3E9F7" />
      <Path path="M1060 170H1360V420H1060ZM1210 170V420M1060 295H1360" style="stroke" strokeWidth={12} color="#2A4373" />
      <Path path="M1060 170L1360 170L900 760L460 760Z" color="rgba(150,180,255,0.09)">
        <Blur blur={10} />
      </Path>
      <Rect x={-600} y={760} width={2800} height={800} color="#0F1A3A" />
      {/* Cama */}
      <RoundedRect x={240} y={470} width={40} height={300} r={8} color="#2E4475" />
      <RoundedRect x={260} y={640} width={980} height={90} r={16} color="#24396A" />
      <RoundedRect x={270} y={600} width={960} height={60} r={20} color="#3A5287" />
      <RoundedRect x={300} y={540} width={240} height={80} r={36} color="#DCE3EF" />
      {/* Vecino: acostado y luego sentado */}
      <Group origin={vec(700, 600)} transform={sit}>
        <RoundedRect x={640} y={370} width={120} height={240} r={55} color="#9FC3E8" />
        <Path path="M640 440H760M640 490H760M640 540H760" style="stroke" strokeWidth={8} color="#7FA6D3" />
        <Circle cx={700} cy={310} r={62} color="#C68E62" />
        <Path path="M640 300Q640 240 700 240Q760 240 760 300Q735 280 700 282Q665 284 640 300Z" color="#20160F" />
      </Group>
      <RoundedRect x={680} y={560} width={560} height={110} r={50} color="#4E6BA8" />
      {/* Velador, lámpara y celular */}
      <Rect x={60} y={620} width={170} height={200} color="#22355E" />
      <Rect x={136} y={540} width={14} height={80} color="#3A4F7A" />
      <Path path="M100 470H186L206 545H80Z" color="#8C7A55" />
      <Group opacity={lamp}>
        <Circle cx={143} cy={510} r={160} color="rgba(255,210,122,0.5)">
          <BlurMask blur={60} style="normal" />
        </Circle>
        <Path path="M100 470H186L206 545H80Z" color="#FFE2A8" />
      </Group>
      <Group transform={buzz}>
        <Circle cx={145} cy={600} r={120} color="rgba(255,70,80,0.55)" opacity={ring}>
          <BlurMask blur={40} style="normal" />
        </Circle>
        <RoundedRect x={95} y={596} width={100} height={26} r={6} color="#0B1631" />
        <RoundedRect x={100} y={599} width={90} height={20} r={4} color="#FF5A64" opacity={ring} />
      </Group>
      <Rect x={-600} y={-600} width={2800} height={2200} color="#FFD27A" opacity={warm} />
    </Group>
  );
}

/* ---------- 2. Patrulla más cercana ---------- */
function Patrol({ clock, frame }: { clock: Num; frame: Frame }) {
  const s = CUTS[1].start;
  const op = useDerivedValue(() => cutOpacity(clock.value, 1));
  const tr = useInteriorCam(clock, 1, frame, [760, 590, 1.0], [860, 600, 1.08]);
  const lt = useDerivedValue(() => clock.value - s);
  const go = useDerivedValue(() => easeIn(prog(lt.value, 0.8, 1.6)));
  const carX = useDerivedValue(() => 380 + go.value * 1700);
  const bg = useDerivedValue<Transforms3d>(() => [{ translateX: -go.value * 500 }]);
  const tablet = useDerivedValue(() => (lt.value > 0.15 ? 0.6 + 0.4 * Math.sin(lt.value * 16) : 0));
  const wash = useDerivedValue(() => (lt.value > 0.35 ? (Math.floor(lt.value * 6) % 2 === 0 ? 0.22 : 0.06) : 0));
  const washBlue = useDerivedValue(() => (lt.value > 0.35 ? 0.28 - wash.value : 0));
  const streaks = useDerivedValue(() => prog(lt.value, 0.85, 1.05));
  const carClock = useDerivedValue(() => (lt.value > 0.35 ? clock.value : 0));
  const carTr = useDerivedValue<Transforms3d>(() => [
    { translateX: carX.value }, { translateY: 778 }, { scale: 3.2 }, { translateY: -858 },
  ]);
  const zero = useDerivedValue<number>(() => 0);
  return (
    <Group opacity={op} transform={tr}>
      <Rect x={-600} y={-600} width={2800} height={2200}>
        <LinearGradient start={vec(0, -300)} end={vec(0, 800)} colors={['#040A1E', '#12244E']} />
      </Rect>
      <Group transform={bg}>
        {Array.from({ length: 16 }).map((_, k) => (
          <Rect key={k} x={-500 + k * 210} y={160 + (k % 4) * 60} width={180} height={700} color={k % 2 ? '#14274F' : '#102043'} />
        ))}
        {Array.from({ length: 40 }).map((_, k) => (
          <Rect key={`w${k}`} x={-460 + ((k * 97) % 3200)} y={260 + ((k * 53) % 300)} width={22} height={30} color={k % 3 ? '#0D1838' : '#FFD27A'} />
        ))}
      </Group>
      <Rect x={-600} y={800} width={2800} height={800} color="#070E22" />
      <Rect x={-600} y={792} width={2800} height={10} color="#2D4A80" />
      <Group opacity={streaks}>
        {[0, 1, 2, 3, 4].map((k) => (
          <RoundedRect key={k} x={-200 + k * 60} y={420 + k * 70} width={420} height={6} r={3} color="rgba(110,168,255,0.6)" />
        ))}
      </Group>
      <Group transform={carTr}>
        <PoliceCar clock={carClock} x={zero} />
        {/* Oficial y tableta con la alerta, detrás del vidrio */}
        <Group transform={[{ translateY: 858 }]}>
          <Circle cx={108} cy={-93} r={7} color="#B9825B" />
          <RoundedRect x={101} y={-103} width={14} height={5} r={1.5} color="#0F1A33" />
          <Circle cx={124} cy={-88} r={12} color="rgba(255,70,80,0.7)" opacity={tablet}>
            <BlurMask blur={8} style="normal" />
          </Circle>
          <RoundedRect x={119} y={-92} width={10} height={8} r={1} color="#FF5A64" opacity={tablet} />
        </Group>
      </Group>
      <Rect x={-600} y={-600} width={2800} height={2200} color={C.sos} opacity={wash} />
      <Rect x={-600} y={-600} width={2800} height={2200} color={C.police} opacity={washBlue} />
    </Group>
  );
}

/* ---------- 3. Papás de Valentina ---------- */
function Parents({ clock, frame }: { clock: Num; frame: Frame }) {
  const s = CUTS[2].start;
  const op = useDerivedValue(() => cutOpacity(clock.value, 2));
  const tr = useInteriorCam(clock, 2, frame, [820, 560, 1.05], [940, 560, 1.12]);
  const lt = useDerivedValue(() => clock.value - s);
  const phone = useDerivedValue(() => (lt.value > 0.15 ? 0.6 + 0.4 * Math.sin(lt.value * 18) : 0));
  const run = useDerivedValue(() => easeIn(prog(lt.value, 0.7, 1.55)));
  const walk = useDerivedValue<number>(() => (lt.value > 0.7 ? 1 : 0));
  const dadX = useDerivedValue(() => 700 + run.value * 560);
  const momX = useDerivedValue(() => 860 + run.value * 480);
  const door = useDerivedValue<Transforms3d>(() => [{ scaleX: 1 - 0.85 * easeOut(prog(lt.value, 0.45, 0.85)) }]);
  const scale = 2.7;
  return (
    <Group opacity={op} transform={tr}>
      <Rect x={-600} y={-600} width={2800} height={2200}>
        <LinearGradient start={vec(0, -200)} end={vec(0, 860)} colors={['#191D3A', '#2B2A4A']} />
      </Rect>
      <Circle cx={240} cy={380} r={260} color="rgba(255,200,120,0.25)">
        <BlurMask blur={80} style="normal" />
      </Circle>
      <Rect x={-600} y={860} width={2800} height={800} color="#1E2442" />
      {/* Foto de Valentina */}
      <RoundedRect x={520} y={240} width={150} height={120} r={6} color="#2A3A66" />
      <RoundedRect x={520} y={240} width={150} height={120} r={6} color={C.gold} style="stroke" strokeWidth={8} />
      <Circle cx={595} cy={290} r={22} color="#EBB892" />
      <RoundedRect x={575} y={312} width={40} height={40} r={10} color="#EEF2F8" />
      {/* Sofá y lámpara */}
      <RoundedRect x={80} y={640} width={460} height={70} r={30} color="#3E5C96" />
      <RoundedRect x={80} y={690} width={460} height={170} r={26} color="#33497A" />
      <Rect x={230} y={430} width={12} height={430} color="#3A3550" />
      <Path path="M180 380H292L312 450H160Z" color="#FFE2A8" />
      {/* Puerta hacia la calle */}
      <Rect x={1150} y={330} width={220} height={530} color="#0E1F45" />
      <Rect x={1150} y={700} width={220} height={160} color="#13284F" />
      <Group origin={vec(1370, 600)} transform={door}>
        <Rect x={1150} y={330} width={220} height={530} color="#5B4636" />
        <Circle cx={1180} cy={600} r={9} color="#C9A35A" />
      </Group>
      <Adult clock={clock} x={dadX} y={860} scale={scale} walk={walk} phone={phone}
        look={{ body: '#556B8F', legs: '#26365A', skin: '#C68E62', hair: 'short' }} />
      <Adult clock={clock} x={momX} y={860} scale={scale} walk={walk} phone={phone}
        look={{ body: '#C2414B', legs: '#2C2F45', skin: '#E2B08A', hair: 'long' }} />
    </Group>
  );
}

export function Interiors({ clock, W, H }: { clock: Num; W: number; H: number }) {
  const frame = { W, H };
  return (
    <>
      <Apartment clock={clock} frame={frame} />
      <Patrol clock={clock} frame={frame} />
      <Parents clock={clock} frame={frame} />
    </>
  );
}
