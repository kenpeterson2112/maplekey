import { EMPTY_PLAN, type LessonPlan, type PlanFieldId, type WalkthroughScript } from './types';

// Turns a script into a fixed timeline so the player can be paused, sped up,
// or scrubbed: the whole on-screen state is a pure function of elapsed time.

export interface Pacing {
  msPerNarrationChar: number;
  minNarrationMs: number;
  moveMs: number;
  msPerTypedChar: number;
  holdMs: number;
}

export const DEFAULT_PACING: Pacing = {
  msPerNarrationChar: 45,
  minNarrationMs: 2200,
  moveMs: 700,
  msPerTypedChar: 22,
  holdMs: 600,
};

interface Segment {
  kind: 'intro' | 'narrate' | 'move' | 'type' | 'hold' | 'outro';
  start: number;
  end: number;
  beat: number; // -1 for intro/outro
}

export interface Timeline {
  script: WalkthroughScript;
  segments: Segment[];
  duration: number;
}

export interface Frame {
  plan: LessonPlan;
  beat: number;
  activeField: PlanFieldId | null;
  narration: string;
  typing: boolean;
  done: boolean;
}

function readingTime(text: string, p: Pacing): number {
  return Math.max(p.minNarrationMs, text.length * p.msPerNarrationChar);
}

export function buildTimeline(script: WalkthroughScript, pacing: Pacing = DEFAULT_PACING): Timeline {
  const segments: Segment[] = [];
  let t = 0;
  const push = (kind: Segment['kind'], ms: number, beat: number) => {
    segments.push({ kind, start: t, end: t + ms, beat });
    t += ms;
  };

  push('intro', readingTime(script.intro, pacing), -1);
  script.beats.forEach((b, i) => {
    push('narrate', readingTime(b.narration, pacing), i);
    push('move', pacing.moveMs, i);
    push('type', b.text.length * pacing.msPerTypedChar, i);
    push('hold', pacing.holdMs, i);
  });
  push('outro', readingTime(script.outro, pacing), -1);

  return { script, segments, duration: t };
}

export function frameAt(timeline: Timeline, time: number): Frame {
  const { script, segments, duration } = timeline;
  const t = Math.min(Math.max(time, 0), duration);
  const seg = segments.find((s) => t < s.end) ?? segments[segments.length - 1];

  const plan: LessonPlan = { ...EMPTY_PLAN };
  // Every beat before the current one is fully typed.
  const upTo = seg.kind === 'outro' ? script.beats.length : Math.max(seg.beat, 0);
  for (let i = 0; i < upTo; i++) plan[script.beats[i].field] = script.beats[i].text;

  if (seg.beat < 0) {
    return {
      plan,
      beat: seg.kind === 'intro' ? -1 : script.beats.length,
      activeField: null,
      narration: seg.kind === 'intro' ? script.intro : script.outro,
      typing: false,
      done: t >= duration,
    };
  }

  const beat = script.beats[seg.beat];
  if (seg.kind === 'type') {
    const span = seg.end - seg.start;
    const chars = span === 0 ? beat.text.length : Math.floor(((t - seg.start) / span) * beat.text.length);
    plan[beat.field] = beat.text.slice(0, chars);
  } else if (seg.kind === 'hold') {
    plan[beat.field] = beat.text;
  }

  return {
    plan,
    beat: seg.beat,
    activeField: seg.kind === 'narrate' ? null : beat.field,
    narration: beat.narration,
    typing: seg.kind === 'type',
    done: false,
  };
}

// Start time of each beat, for "previous / next step" controls.
export function beatStarts(timeline: Timeline): number[] {
  return timeline.segments.filter((s) => s.kind === 'narrate').map((s) => s.start);
}
