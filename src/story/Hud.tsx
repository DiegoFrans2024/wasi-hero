import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { ALERT_LIST_END, type Cut, type Label as LabelItem, streetVisible } from './timeline';
import { prog, win } from './math';
import { C, FONT } from './theme';
import type { Cam } from './StoryCanvas';

type Num = SharedValue<number>;
/** Etiqueta de la IA, anclada a un punto de la escena y con tamaño de texto fijo. */
function Label({ clock, cam, item }: { clock: Num; cam: SharedValue<Cam>; item: LabelItem }) {
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

/** Rótulo de cada corte, con forma de notificación del celular: quién recibe la alerta. Se suma a la lista y no se borra. */
function Chyron({ clock, cuts, i }: { clock: Num; cuts: Cut[]; i: number }) {
  const cut = cuts[i];
  const next = i < cuts.length - 1 ? cuts[i + 1].start : ALERT_LIST_END;
  const box = useAnimatedStyle(() => {
    const t = clock.value;
    const o = prog(t, cut.start, cut.start + 0.25) * (1 - prog(t, ALERT_LIST_END - 0.4, ALERT_LIST_END));
    // El corte en pantalla va resaltado; los anteriores quedan un poco atenuados
    // Llega como notificación: baja, y vibra medio segundo
    const lt = t - cut.start;
    const shake = lt > 0 && lt < 0.6 ? Math.sin(lt * 70) * 5 * (1 - lt / 0.6) : 0;
    return {
      opacity: o * (1 - 0.25 * prog(t, next, next + 0.3)),
      transform: [{ translateY: (1 - prog(t, cut.start, cut.start + 0.3)) * -18 }, { translateX: shake }],
    };
  });
  const b = useAnimatedStyle(() => ({ opacity: prog(clock.value, cut.start + cut.swap, cut.start + cut.swap + 0.25) }));
  return (
    <Animated.View style={[styles.chyron, { borderColor: cut.color }, box]}>
      <View style={styles.chyronHead}>
        <View style={styles.appIcon}>
          <Text style={styles.appIconText}>W</Text>
        </View>
        <Text style={styles.chyronTitle} numberOfLines={1}>{cut.title}</Text>
        <Text style={styles.chyronTime}>Wasi · ahora</Text>
      </View>
      <Text style={styles.chyronText}>{cut.a}</Text>
      <Animated.Text style={[styles.chyronText, styles.chyronB, { color: cut.color }, b]}>{cut.b}</Animated.Text>
    </Animated.View>
  );
}

type HudProps = { clock: Num; cam: SharedValue<Cam>; top: number; landscape: boolean; labels: LabelItem[]; cuts: Cut[] };

export function Hud({ clock, cam, top, landscape, labels, cuts }: HudProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {labels.map((l) => (
        <Label key={l.text} clock={clock} cam={cam} item={l} />
      ))}
      <View style={[styles.chyrons, landscape ? styles.chyronsLand : styles.chyronsPort, { top }]}>
        {cuts.map((_, i) => (
          <Chyron key={i} clock={clock} cuts={cuts} i={i} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { position: 'absolute', left: 0, top: 0, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7 },
  tag: { borderRadius: 999, borderWidth: 1.5, borderColor: C.scan },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.scan },
  labelText: { color: '#fff', fontFamily: FONT.bold, fontSize: 13 },
  chyrons: { position: 'absolute', gap: 8 },
  chyronsPort: { left: 16, right: 16, maxWidth: 380 },
  chyronsLand: { right: 24, width: 340 },
  chyron: { backgroundColor: 'rgba(7,14,34,0.9)', borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  chyronHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  appIcon: { width: 20, height: 20, borderRadius: 5, backgroundColor: C.sos, alignItems: 'center', justifyContent: 'center' },
  appIconText: { color: '#fff', fontFamily: 'Unbounded_800ExtraBold', fontSize: 10, lineHeight: 12 },
  chyronTitle: { color: '#fff', fontFamily: FONT.bold, fontSize: 15, flex: 1 },
  chyronTime: { color: '#9FB0CC', fontFamily: FONT.semi, fontSize: 12 },
  chyronText: { color: '#C7D3E8', fontFamily: FONT.semi, fontSize: 15, lineHeight: 20 },
  chyronB: { fontFamily: FONT.bold },
});
