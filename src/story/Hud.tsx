import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { CUTS, END, streetVisible } from './timeline';
import { prog, win } from './math';
import { C, FONT } from './theme';
import type { Cam } from './StoryCanvas';

type Num = SharedValue<number>;
type Kind = 'tag' | 'danger' | 'ok';

/** Etiquetas de la IA, ancladas a puntos de la escena y con tamaño de texto fijo. */
const LABELS: { text: string; x: number; y: number; a: number; b: number; kind: Kind }[] = [
  { text: 'Cámara IP', x: 830, y: 500, a: 6.6, b: 12.2, kind: 'tag' },
  { text: 'Celular reciclado', x: 1212, y: 555, a: 7.0, b: 12.2, kind: 'tag' },
  { text: 'Dron', x: 1110, y: 236, a: 9.0, b: 12.2, kind: 'tag' },
  { text: 'Arma detectada · 94%', x: 1236, y: 778, a: 7.7, b: 22.8, kind: 'danger' },
  { text: 'Susto detectado · 96%', x: 956, y: 626, a: 9.8, b: 12.15, kind: 'danger' },
  { text: 'Alerta enviada', x: 956, y: 626, a: 12.15, b: 20, kind: 'danger' },
  { text: 'A salvo', x: 1030, y: 626, a: 28.2, b: END + 5, kind: 'ok' },
];

function Label({ clock, cam, item }: { clock: Num; cam: SharedValue<Cam>; item: (typeof LABELS)[number] }) {
  const style = useAnimatedStyle(() => {
    const t = clock.value;
    const o = win(t, item.a, item.b, 0.25) * streetVisible(t);
    return {
      opacity: o,
      transform: [
        { translateX: cam.value.tx + item.x * cam.value.s },
        { translateY: cam.value.ty + item.y * cam.value.s - 34 },
        { scale: 0.92 + 0.08 * prog(t, item.a, item.a + 0.25) },
      ],
    };
  });
  const bg = item.kind === 'danger' ? C.sos : item.kind === 'ok' ? C.signal : 'rgba(8,16,38,0.9)';
  return (
    <Animated.View style={[styles.label, { backgroundColor: bg }, item.kind === 'tag' && styles.tag, style]}>
      {item.kind === 'tag' && <View style={styles.dot} />}
      <Text style={styles.labelText}>{item.text}</Text>
    </Animated.View>
  );
}

/** Rótulo de cada corte: quién está recibiendo la alerta. */
function Chyron({ clock, i, top }: { clock: Num; i: number; top: number }) {
  const cut = CUTS[i];
  const box = useAnimatedStyle(() => {
    const t = clock.value;
    const o = t >= cut.start && t <= cut.end ? Math.min(1, (t - cut.start) / 0.2) : 0;
    return { opacity: o, transform: [{ translateY: (1 - o) * -8 }] };
  });
  const a = useAnimatedStyle(() => ({ opacity: 1 - prog(clock.value, cut.start + cut.swap, cut.start + cut.swap + 0.2) }));
  const b = useAnimatedStyle(() => ({ opacity: prog(clock.value, cut.start + cut.swap, cut.start + cut.swap + 0.2) }));
  return (
    <Animated.View pointerEvents="none" style={[styles.chyron, { top, borderColor: cut.color }, box]}>
      <View style={styles.chyronHead}>
        <View style={[styles.live, { backgroundColor: cut.color }]} />
        <Text style={styles.chyronTitle}>{cut.title}</Text>
        <Text style={styles.chyronTime}>Alerta Wasi</Text>
      </View>
      <View>
        <Animated.Text style={[styles.chyronText, a]}>{cut.a}</Animated.Text>
        <Animated.Text style={[styles.chyronText, styles.chyronB, { color: cut.color }, b]}>{cut.b}</Animated.Text>
      </View>
    </Animated.View>
  );
}

export function Hud({ clock, cam, top }: { clock: Num; cam: SharedValue<Cam>; top: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {LABELS.map((l) => (
        <Label key={l.text} clock={clock} cam={cam} item={l} />
      ))}
      {CUTS.map((_, i) => (
        <Chyron key={i} clock={clock} i={i} top={top} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { position: 'absolute', left: 0, top: 0, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7 },
  tag: { borderRadius: 999, borderWidth: 1.5, borderColor: C.scan },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.scan },
  labelText: { color: '#fff', fontFamily: FONT.bold, fontSize: 13 },
  chyron: { position: 'absolute', left: 16, right: 16, maxWidth: 380, backgroundColor: 'rgba(7,14,34,0.88)', borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  chyronHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  live: { width: 8, height: 8, borderRadius: 4 },
  chyronTitle: { color: '#fff', fontFamily: FONT.bold, fontSize: 15, flex: 1 },
  chyronTime: { color: '#9FB0CC', fontFamily: FONT.semi, fontSize: 12 },
  chyronText: { color: '#C7D3E8', fontFamily: FONT.semi, fontSize: 14 },
  chyronB: { position: 'absolute', left: 0, top: 0 },
});
