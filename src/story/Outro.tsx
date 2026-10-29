import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { Canvas, Path } from '@shopify/react-native-skia';
import { BEATS, OUTRO } from './timeline';
import { easeOut, easeOutBack, mix, prog } from './math';
import { C, FONT } from './theme';

type Num = SharedValue<number>;
type Beat = (typeof BEATS)[number];

type Props = {
  clock: Num;
  W: number;
  H: number;
  /** Solo recibe toques cuando el cierre está en pantalla. */
  active: boolean;
  onJoin?: () => void;
  onLearnMore?: () => void;
  onAppStore?: () => void;
  onGooglePlay?: () => void;
};

/** Destello del color de cada golpe, a pantalla completa. */
function Flash({ clock, at, color, peak }: { clock: Num; at: number; color: string; peak: number }) {
  const style = useAnimatedStyle(() => {
    const t = clock.value;
    return { opacity: t < at ? 0 : peak * (1 - prog(t, at, at + 0.4)) };
  });
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color }, style]} />;
}

/** WASI + verbo: entra de golpe, se subraya y se apaga cuando llega el siguiente. */
function BeatRow({ clock, i, size }: { clock: Num; i: number; size: number }) {
  const beat: Beat = BEATS[i];
  const next = i < BEATS.length - 1 ? BEATS[i + 1].t : null;
  const row = useAnimatedStyle(() => {
    const t = clock.value;
    const dim = next === null ? 0 : prog(t, next, next + 0.2) * (1 - prog(t, OUTRO.allLit, OUTRO.allLit + 0.2));
    return {
      opacity: prog(t, beat.t, beat.t + 0.1) * (1 - 0.6 * dim),
      transform: [{ scale: mix(1.3, 1, easeOutBack(prog(t, beat.t, beat.t + 0.32))) }],
    };
  });
  const underline = useAnimatedStyle(() => ({
    width: `${easeOut(prog(clock.value, beat.t + 0.1, beat.t + 0.45)) * 100}%`,
  }));
  return (
    <Animated.View style={[styles.row, row]}>
      <Text style={[styles.wasi, { fontSize: size }]}>WASI</Text>
      <View>
        <Text style={[styles.verb, { fontSize: size, color: beat.color }]}>{beat.verb}</Text>
        <Animated.View style={[styles.underline, { backgroundColor: beat.color, height: Math.max(3, size * 0.09) }, underline]} />
      </View>
    </Animated.View>
  );
}

function Word({ clock, at, children, style }: { clock: Num; at: number; children: string; style: StyleProp<TextStyle> }) {
  const anim = useAnimatedStyle(() => {
    const p = prog(clock.value, at, at + 0.35);
    return { opacity: p, transform: [{ translateY: (1 - easeOut(p)) * 18 }] };
  });
  return <Animated.Text style={[style, anim]}>{children}</Animated.Text>;
}

/** Sube y aparece a partir del segundo `at`. */
function Rise({ clock, at, children }: { clock: Num; at: number; children: React.ReactNode }) {
  const style = useAnimatedStyle(() => {
    const p = prog(clock.value, at, at + 0.35);
    return { opacity: p, transform: [{ translateY: (1 - easeOut(p)) * 20 }] };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Ondas que salen del botón, como la alerta que llega a todos. */
function Ring({ clock, phase, offset }: { clock: Num; phase: Num; offset: number }) {
  const style = useAnimatedStyle(() => {
    const r = (phase.value + offset) % 1;
    const show = prog(clock.value, OUTRO.join + 0.3, OUTRO.join + 0.6);
    return { opacity: (1 - r) * 0.7 * show, transform: [{ scaleX: 1 + r * 0.35 }, { scaleY: 1 + r * 0.9 }] };
  });
  return <Animated.View pointerEvents="none" style={[styles.ring, style]} />;
}

const APPLE =
  'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701';
const PLAY: [string, string][] = [
  ['M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924z', '#00C3FF'],
  ['M13.544 10.989l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973z', '#00E676'],
  ['M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z', '#FFD500'],
  ['M13.544 13.056l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z', '#FF3A44'],
];

function StoreBadge({ store, onPress }: { store: 'apple' | 'google'; onPress?: () => void }) {
  const apple = store === 'apple';
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={apple ? 'Descargar en el App Store' : 'Disponible en Google Play'}
      onPress={onPress}
      style={({ pressed }) => [styles.badge, pressed && styles.pressed]}
    >
      <Canvas style={styles.badgeIcon}>
        {apple ? <Path path={APPLE} color="#FFFFFF" /> : PLAY.map(([d, color]) => <Path key={color} path={d} color={color} />)}
      </Canvas>
      <View>
        <Text style={styles.badgeKicker}>{apple ? 'Descargar en el' : 'DISPONIBLE EN'}</Text>
        <Text style={styles.badgeName}>{apple ? 'App Store' : 'Google Play'}</Text>
      </View>
    </Pressable>
  );
}

/** Cierre de marca: Wasi detecta, alerta, protege · Wasi somos todos · Únete. */
export function Outro({ clock, W, H, active, onJoin, onLearnMore, onAppStore, onGooglePlay }: Props) {
  const reduceMotion = useReducedMotion();
  const k = Math.min(W, H * 0.75);
  const line = Math.round(Math.min(58, Math.max(26, k * 0.075)));
  const big = Math.round(Math.min(150, Math.max(64, k * 0.22)));

  const phase = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    phase.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
  }, [phase, reduceMotion]);

  const backdrop = useAnimatedStyle(() => ({ opacity: prog(clock.value, OUTRO.start, OUTRO.start + 0.8) * 0.9 }));
  const beats = useAnimatedStyle(() => {
    const p = easeOut(prog(clock.value, OUTRO.collapse, OUTRO.collapse + 0.35));
    return { opacity: 1 - p, transform: [{ translateY: -28 * p }, { scale: 1 - 0.08 * p }] };
  });
  const mark = useAnimatedStyle(() => {
    const t = clock.value;
    return {
      opacity: prog(t, OUTRO.together, OUTRO.together + 0.15),
      transform: [{ scale: mix(0.7, 1, easeOutBack(prog(t, OUTRO.together, OUTRO.together + 0.45))) }],
    };
  });
  const join = useAnimatedStyle(() => {
    const t = clock.value;
    return {
      opacity: prog(t, OUTRO.join, OUTRO.join + 0.15),
      transform: [{ scale: mix(0.6, 1, easeOutBack(prog(t, OUTRO.join, OUTRO.join + 0.4))) }],
    };
  });

  return (
    <View pointerEvents={active ? 'box-none' : 'none'} style={StyleSheet.absoluteFill}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]} />
      {BEATS.map((b) => (
        <Flash key={b.verb} clock={clock} at={b.t} color={b.color} peak={0.22} />
      ))}
      <Flash clock={clock} at={OUTRO.together} color="#FFFFFF" peak={0.35} />

      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View style={[styles.beats, beats]}>
          {BEATS.map((b, i) => (
            <BeatRow key={b.verb} clock={clock} i={i} size={line} />
          ))}
        </Animated.View>
      </View>

      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View style={[styles.mark, mark]}>
          <Text style={[styles.markWasi, { fontSize: big, lineHeight: big * 1.1 }]}>WASI</Text>
        </Animated.View>
        <View style={styles.together}>
          <Word clock={clock} at={OUTRO.together + 0.3} style={[styles.togetherText, { fontSize: big * 0.2, letterSpacing: big * 0.06 }]}>SOMOS</Word>
          <Word clock={clock} at={OUTRO.together + 0.55} style={[styles.togetherText, styles.todos, { fontSize: big * 0.2, letterSpacing: big * 0.06 }]}>TODOS</Word>
        </View>

        <Animated.View style={[styles.joinWrap, join]}>
          {!reduceMotion && <Ring clock={clock} phase={phase} offset={0} />}
          {!reduceMotion && <Ring clock={clock} phase={phase} offset={0.5} />}
          <Pressable
            accessibilityRole="button"
            onPress={onJoin}
            style={({ pressed }) => [styles.joinBtn, pressed && styles.pressed]}
          >
            <Text style={[styles.joinText, { fontSize: Math.max(22, line * 0.8) }]}>ÚNETE</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.stores}>
          <Rise clock={clock} at={OUTRO.stores}>
            <StoreBadge store="apple" onPress={onAppStore} />
          </Rise>
          <Rise clock={clock} at={OUTRO.stores + 0.15}>
            <StoreBadge store="google" onPress={onGooglePlay} />
          </Rise>
        </View>
        <Rise clock={clock} at={OUTRO.stores + 0.4}>
          <Pressable accessibilityRole="button" onPress={onLearnMore} hitSlop={8}>
            <Text style={styles.more}>Ver cómo funciona</Text>
          </Pressable>
        </Rise>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: C.ink },
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 96 },
  beats: { alignItems: 'flex-start', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, transformOrigin: 'left center' },
  wasi: { color: '#fff', fontFamily: 'Unbounded_800ExtraBold', letterSpacing: 0.5 },
  verb: { fontFamily: FONT.display },
  underline: { marginTop: 4, borderRadius: 4 },
  mark: { alignItems: 'center' },
  markWasi: { color: '#fff', fontFamily: 'Unbounded_800ExtraBold', letterSpacing: 1 },
  together: { flexDirection: 'row', gap: 14, marginTop: 2 },
  togetherText: { color: '#fff', fontFamily: FONT.bold },
  todos: { color: C.sos },
  joinWrap: { marginTop: 30, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 999, borderWidth: 2, borderColor: C.sos },
  joinBtn: { backgroundColor: C.sos, borderRadius: 999, paddingHorizontal: 44, paddingVertical: 16 },
  joinText: { color: '#fff', fontFamily: 'Unbounded_800ExtraBold', letterSpacing: 1.5 },
  stores: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 26 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#000', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', paddingLeft: 12, paddingRight: 16, paddingVertical: 7, minWidth: 156 },
  badgeIcon: { width: 24, height: 24 },
  badgeKicker: { color: '#fff', fontFamily: FONT.semi, fontSize: 10, letterSpacing: 0.3 },
  badgeName: { color: '#fff', fontFamily: FONT.bold, fontSize: 18, lineHeight: 21 },
  more: { color: '#C2CDE0', fontFamily: FONT.semi, fontSize: 14, textDecorationLine: 'underline', marginTop: 18 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
});
