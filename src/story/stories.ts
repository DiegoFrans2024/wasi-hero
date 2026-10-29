import type { ComponentType } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { CUTS, KF, LABELS, STAGES, type Cut, type Label, type Stage } from './timeline';
import { Street } from './Street';
import { Interiors } from './Interiors';
import { BusScene } from './bus/BusScene';
import { BusInteriors } from './bus/BusInteriors';
import { BUS_CUTS, BUS_KF, BUS_LABELS, BUS_STAGES } from './bus/busTimeline';

type Num = SharedValue<number>;

/** Una historia: sus textos, su cámara, sus etiquetas y sus escenas. Todas comparten los tiempos de `timeline.ts`. */
export type StoryDef = {
  title: string;
  stages: Stage[];
  cuts: Cut[];
  kf: number[][];
  labels: Label[];
  rain: boolean;
  Scene: ComponentType<{ clock: Num }>;
  Interiors: ComponentType<{ clock: Num; W: number; H: number }>;
};

export const STORIES: StoryDef[] = [
  { title: 'Camino a casa', stages: STAGES, cuts: CUTS, kf: KF, labels: LABELS, rain: true, Scene: Street, Interiors },
  { title: 'Bus al colegio', stages: BUS_STAGES, cuts: BUS_CUTS, kf: BUS_KF, labels: BUS_LABELS, rain: false, Scene: BusScene, Interiors: BusInteriors },
];

/**
 * Segundos que el cierre queda en ÚNETE antes de pasar a la siguiente historia.
 * Como en la reproducción automática de Netflix o YouTube (5–10 s): sumado a los ~2 s que Únete ya
 * lleva en pantalla, da tiempo de leer y tocar las tiendas sin que la espera se sienta larga.
 */
export const NEXT_STORY_DELAY = 7;
