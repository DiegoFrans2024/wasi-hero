/** Pequeñas funciones de animación. Todas son worklets: corren en el hilo de UI. */

export function clamp01(x: number) {
  'worklet';
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** Progreso 0→1 de t entre a y b. */
export function prog(t: number, a: number, b: number) {
  'worklet';
  return clamp01((t - a) / (b - a));
}

export function mix(a: number, b: number, p: number) {
  'worklet';
  return a + (b - a) * p;
}

export function easeInOut(x: number) {
  'worklet';
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOut(x: number) {
  'worklet';
  return 1 - Math.pow(1 - x, 3);
}

export function easeOutQuint(x: number) {
  'worklet';
  return 1 - Math.pow(1 - x, 5);
}

export function easeIn(x: number) {
  'worklet';
  return x * x * x;
}

export function easeOutBack(x: number) {
  'worklet';
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/** 1 dentro de [a, b], con entrada y salida suaves de duración `fade`. */
export function win(t: number, a: number, b: number, fade = 0.25) {
  'worklet';
  return Math.min(prog(t, a, a + fade), 1 - prog(t, b - fade, b));
}

/** Generador pseudoaleatorio con semilla: la ciudad sale igual en cada render. */
export function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
