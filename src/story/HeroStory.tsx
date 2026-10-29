import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation, Easing, FadeInDown, FadeOut, useAnimatedReaction, useAnimatedStyle,
  useDerivedValue, useReducedMotion, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import { Unbounded_700Bold, Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { StoryCanvas, type Cam } from './StoryCanvas';
import { Hud } from './Hud';
import { Outro } from './Outro';
import { camAt, END, HAPTICS, type HapticKind, OUTRO, shakeAt, stageEnd, stageIndex, STAGES } from './timeline';
import { prog } from './math';
import { C, FONT } from './theme';

type Props = {
  /** Botón principal al final de la historia. */
  onJoin?: () => void;
  /** Botón secundario al final de la historia. */
  onLearnMore?: () => void;
  /** Logos de las tiendas en el cierre. */
  onAppStore?: () => void;
  onGooglePlay?: () => void;
};

function vibrate(kind: HapticKind) {
  if (Platform.OS === 'web') return;
  if (kind === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  else if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else if (kind === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function HeroStory({ onJoin, onLearnMore, onAppStore, onGooglePlay }: Props) {
  useFonts({ Unbounded_700Bold, Unbounded_800ExtraBold, Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold });
  const { width: W, height: H } = useWindowDimensions();
  const landscape = W > H;
  const reduceMotion = useReducedMotion();

  const clock = useSharedValue(0);
  const [stage, setStage] = useState(0);
  const [ended, setEnded] = useState(false);

  // Cámara: encuadre por momento de la historia + sacudón
  const cam = useDerivedValue<Cam>(() => {
    const c = camAt(clock.value);
    const sh = shakeAt(clock.value);
    const s = Math.max(W / 1600, H / 1250) * c.z * (landscape ? 1 : 0.88);
    const fx = landscape ? W * 0.6 : W * 0.5;
    const fy = landscape ? H * 0.46 : H * 0.38;
    return { s, tx: fx - c.x * s + sh.x, ty: fy - c.y * s + sh.y };
  }, [W, H, landscape]);

  const play = useCallback((from: number) => {
    cancelAnimation(clock);
    clock.value = from;
    clock.value = withTiming(END, { duration: (END - from) * 1000, easing: Easing.linear });
  }, [clock]);

  const jumpToEnd = useCallback(() => {
    cancelAnimation(clock);
    clock.value = END;
  }, [clock]);

  useEffect(() => {
    // Modo revisión (solo web): ?t=9.9 congela la historia en ese segundo
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const frozen = Number(new URLSearchParams(window.location.search).get('t'));
      if (Number.isFinite(frozen) && frozen > 0) {
        clock.value = Math.min(frozen, END);
        return;
      }
    }
    if (reduceMotion) {
      jumpToEnd();
      return;
    }
    const id = setTimeout(() => play(0), 400);
    return () => clearTimeout(id);
  }, [reduceMotion, play, jumpToEnd, clock]);

  // Sincroniza textos y vibraciones con el reloj de la animación
  useAnimatedReaction(
    () => clock.value,
    (now, prev) => {
      const i = stageIndex(now);
      if (prev === null || stageIndex(prev) !== i) scheduleOnRN(setStage, i);
      const done = now >= END - 0.001;
      if (prev === null || (prev >= END - 0.001) !== done) scheduleOnRN(setEnded, done);
      if (prev !== null && now > prev && now - prev < 0.5) {
        for (let k = 0; k < HAPTICS.length; k++) {
          if (prev < HAPTICS[k].t && now >= HAPTICS[k].t) scheduleOnRN(vibrate, HAPTICS[k].kind);
        }
      }
    },
  );

  const s = STAGES[stage];
  const outro = stage === STAGES.length - 1;
  const chyronTop = landscape ? 84 : 76;
  // El logo pequeño se va cuando entra el WASI grande del cierre
  const navStyle = useAnimatedStyle(() => ({ opacity: 1 - prog(clock.value, OUTRO.together - 0.3, OUTRO.together) }));

  return (
    <View style={styles.root}>
      <StoryCanvas clock={clock} cam={cam} W={W} H={H} />
      <Hud clock={clock} cam={cam} top={chyronTop} />

      <Animated.View style={[styles.nav, navStyle]} pointerEvents="none">
        <Text style={styles.logo}>WASI</Text>
        <Text style={styles.logoSub}>PROTECT</Text>
      </Animated.View>

      <View style={[styles.captionBox, landscape ? styles.captionLand : styles.captionPort]} pointerEvents="box-none">
        {!outro && <Animated.View key={stage} entering={FadeInDown.duration(600)} exiting={FadeOut.duration(250)}>
          <View style={styles.clockRow}>
            <View style={[styles.clockDot, { backgroundColor: s.color }]} />
            <Text style={[styles.clock, { color: s.color }]}>{s.clock}</Text>
          </View>
          <Text style={[styles.headline, landscape && styles.headlineLand]}>{s.headline}</Text>
          <Text style={styles.sub}>{s.sub}</Text>
        </Animated.View>}
      </View>

      <Outro
        clock={clock} W={W} H={H} active={outro}
        onJoin={onJoin} onLearnMore={onLearnMore} onAppStore={onAppStore} onGooglePlay={onGooglePlay}
      />

      <View style={[styles.timeline, landscape && styles.timelineLand]}>
        <View style={styles.segs}>
          {STAGES.map((st, i) => (
            <Segment key={st.label} i={i} active={i === stage} clock={clock} onPress={() => play(st.start)} />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => (ended ? play(0) : jumpToEnd())}
          style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
        >
          <Text style={styles.skipText}>{ended ? 'Ver de nuevo' : 'Saltar'}</Text>
        </Pressable>
      </View>
      <Text style={styles.disclaimer}>Recreación ilustrativa</Text>
    </View>
  );
}

function Segment({ i, active, clock, onPress }: { i: number; active: boolean; clock: import('react-native-reanimated').SharedValue<number>; onPress: () => void }) {
  const st = STAGES[i];
  const end = stageEnd(i);
  const fill = useAnimatedStyle(() => ({ width: `${prog(clock.value, st.start, end) * 100}%` }));
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ir a ${st.label}`} onPress={onPress} style={styles.seg}>
      <View style={styles.bar}>
        <Animated.View style={[styles.barFill, { backgroundColor: st.color }, fill]} />
      </View>
      <Text style={[styles.segText, active && styles.segActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{st.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night, overflow: 'hidden' },
  nav: { position: 'absolute', top: 22, left: 22, alignItems: 'center' },
  logo: { color: '#fff', fontFamily: 'Unbounded_800ExtraBold', fontSize: 22, letterSpacing: 0.5 },
  logoSub: { color: '#fff', fontFamily: FONT.semi, fontSize: 8.5, letterSpacing: 5.5, marginTop: 2, marginRight: -5.5 },
  captionBox: { position: 'absolute' },
  captionPort: { left: 20, right: 20, bottom: 112 },
  captionLand: { left: '5%', width: '42%', maxWidth: 560, bottom: 120 },
  clockRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  clockDot: { width: 8, height: 8, borderRadius: 4 },
  clock: { fontFamily: FONT.semi, fontSize: 14, fontVariant: ['tabular-nums'] },
  headline: { color: '#fff', fontFamily: FONT.display, fontSize: 27, lineHeight: 33 },
  headlineLand: { fontSize: 40, lineHeight: 47 },
  sub: { color: '#C2CDE0', fontFamily: FONT.body, fontSize: 16, lineHeight: 23, marginTop: 10, maxWidth: 440 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  timeline: { position: 'absolute', left: 20, right: 20, bottom: 34, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  timelineLand: { left: '5%', right: '5%' },
  segs: { flex: 1, flexDirection: 'row', gap: 6, maxWidth: 640 },
  seg: { flex: 1, paddingVertical: 6 },
  bar: { height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', marginBottom: 7 },
  barFill: { height: '100%', borderRadius: 4 },
  segText: { color: '#9FB0CC', fontFamily: FONT.semi, fontSize: 11 },
  segActive: { color: '#fff' },
  skip: { borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 8 },
  skipText: { color: '#fff', fontFamily: FONT.bold, fontSize: 13 },
  disclaimer: { position: 'absolute', right: 20, bottom: 12, color: 'rgba(255,255,255,0.45)', fontFamily: FONT.body, fontSize: 11 },
});
