import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, FractalNoise, Group, LinearGradient, Path, RadialGradient, Rect, Skia, vec } from '@shopify/react-native-skia';
import type { Transforms3d } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { Street } from './Street';
import { Interiors } from './Interiors';
import { city } from './city';
import { cutFlash, streetVisible } from './timeline';
import { prog, win } from './math';
import { C } from './theme';

export type Cam = { s: number; tx: number; ty: number };
type Num = SharedValue<number>;

/** Efectos en coordenadas de pantalla: lluvia, alarma, sirenas, viñeta, grano. */
function ScreenFx({ clock, W, H }: { clock: Num; W: number; H: number }) {
  const portrait = H > W;
  const rain = useDerivedValue(() => {
    const t = clock.value;
    const p = Skia.PathBuilder.Make();
    for (let i = 0; i < city.rain.length; i++) {
      const d = city.rain[i];
      const y = (((d[1] + t * d[2] * 1.1) % 1.15) - 0.08) * H;
      const x = d[0] * (W + 80) - 40 - (y / H) * 30;
      p.moveTo(x, y);
      p.lineTo(x - 4, y + d[3]);
    }
    return p.detach();
  }, [W, H]);
  const rainOp = useDerivedValue(() => (1 - prog(clock.value, 27, 30) * 0.6) * streetVisible(clock.value));

  const alarm = useDerivedValue(() => {
    const t = clock.value;
    const a = win(t, 12, 13.2, 0.15) + win(t, 18.2, 20, 0.3) * 0.6;
    return a * (0.45 + 0.55 * Math.abs(Math.sin(t * 7)));
  });
  const sirenColor = useDerivedValue(() => (Math.floor(clock.value * 6) % 2 === 0 ? C.sos : C.police));
  const sirenOp = useDerivedValue(() => win(clock.value, 21, 27, 0.8) * 0.2);
  const flash = useDerivedValue(() => cutFlash(clock.value) * 0.7);
  const R = Math.max(W, H);

  return (
    <>
      <Path path={rain} style="stroke" strokeWidth={1.2} color="rgba(190,210,255,0.38)" opacity={rainOp} />
      <Rect x={0} y={0} width={W} height={H} opacity={alarm}>
        <RadialGradient c={vec(W / 2, H * 0.42)} r={R * 0.75} colors={['rgba(225,29,42,0)', 'rgba(225,29,42,0.75)']} positions={[0.35, 1]} />
      </Rect>
      <Rect x={0} y={0} width={W} height={H} color={sirenColor} opacity={sirenOp} blendMode="screen" />
      {/* Viñeta de cine */}
      <Rect x={0} y={0} width={W} height={H}>
        <RadialGradient c={vec(W / 2, H * 0.42)} r={R * 0.8} colors={['rgba(0,0,0,0)', 'rgba(2,5,16,0.6)']} positions={[0.45, 1]} />
      </Rect>
      {/* Degradado para que los textos se lean */}
      {portrait ? (
        <Rect x={0} y={H * 0.48} width={W} height={H * 0.52}>
          <LinearGradient start={vec(0, H * 0.48)} end={vec(0, H * 0.78)} colors={['rgba(7,14,34,0)', 'rgba(7,14,34,0.96)']} />
        </Rect>
      ) : (
        <>
          <Rect x={0} y={0} width={W * 0.6} height={H}>
            <LinearGradient start={vec(0, 0)} end={vec(W * 0.6, 0)} colors={['rgba(7,14,34,0.92)', 'rgba(7,14,34,0)']} />
          </Rect>
          <Rect x={0} y={H * 0.7} width={W} height={H * 0.3}>
            <LinearGradient start={vec(0, H * 0.7)} end={vec(0, H)} colors={['rgba(7,14,34,0)', 'rgba(7,14,34,0.9)']} />
          </Rect>
        </>
      )}
      <Rect x={0} y={0} width={W} height={H} opacity={0.05} blendMode="overlay">
        <FractalNoise freqX={0.9} freqY={0.9} octaves={2} />
      </Rect>
      <Rect x={0} y={0} width={W} height={H} color="#FFFFFF" opacity={flash} />
    </>
  );
}

export function StoryCanvas({ clock, cam, W, H }: { clock: Num; cam: SharedValue<Cam>; W: number; H: number }) {
  const sceneTr = useDerivedValue<Transforms3d>(() => [
    { translateX: cam.value.tx },
    { translateY: cam.value.ty },
    { scale: cam.value.s },
  ]);
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group transform={sceneTr}>
        <Street clock={clock} />
      </Group>
      <Interiors clock={clock} W={W} H={H} />
      <ScreenFx clock={clock} W={W} H={H} />
    </Canvas>
  );
}
