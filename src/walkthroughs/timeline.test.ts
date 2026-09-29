import { describe, expect, it } from 'vitest';
import { beatStarts, buildTimeline, frameAt, type Pacing } from './timeline';
import type { WalkthroughScript } from './types';

const pacing: Pacing = { msPerNarrationChar: 0, minNarrationMs: 1000, moveMs: 100, msPerTypedChar: 10, holdMs: 100 };

const script: WalkthroughScript = {
  grade: 6,
  subject: 'math',
  topic: 'ratios',
  teacher: 'Ms. Test',
  intro: 'hello',
  beats: [
    { field: 'title', narration: 'name it', text: 'Ratios' }, // 6 chars -> 60ms typing
    { field: 'objective', narration: 'aim', text: 'Compare things' },
  ],
  outro: 'your turn',
};

describe('timeline', () => {
  const tl = buildTimeline(script, pacing);
  // intro 1000 | beat0: narrate 1000, move 100, type 60, hold 100 | beat1: narrate 1000, move 100, type 140, hold 100 | outro 1000
  it('computes total duration', () => {
    expect(tl.duration).toBe(1000 + 1260 + 1340 + 1000);
    expect(beatStarts(tl)).toEqual([1000, 2260]);
  });

  it('starts on the intro with an empty plan', () => {
    const f = frameAt(tl, 0);
    expect(f).toMatchObject({ beat: -1, narration: 'hello', activeField: null, done: false });
    expect(f.plan.title).toBe('');
  });

  it('narrates before moving to the field', () => {
    expect(frameAt(tl, 1500)).toMatchObject({ beat: 0, narration: 'name it', activeField: null, typing: false });
    expect(frameAt(tl, 2050)).toMatchObject({ activeField: 'title', typing: false });
  });

  it('types text progressively', () => {
    const f = frameAt(tl, 2100 + 30); // halfway through typing "Ratios"
    expect(f.typing).toBe(true);
    expect(f.plan.title).toBe('Rat');
  });

  it('keeps earlier beats filled in', () => {
    const f = frameAt(tl, 2300);
    expect(f).toMatchObject({ beat: 1, narration: 'aim' });
    expect(f.plan.title).toBe('Ratios');
    expect(f.plan.objective).toBe('');
  });

  it('ends on the outro with the whole plan filled in', () => {
    const f = frameAt(tl, tl.duration + 500);
    expect(f).toMatchObject({ narration: 'your turn', done: true, activeField: null });
    expect(f.plan).toMatchObject({ title: 'Ratios', objective: 'Compare things' });
  });

  it('handles instant typing (reduced motion)', () => {
    const instant = buildTimeline(script, { ...pacing, moveMs: 0, msPerTypedChar: 0 });
    const f = frameAt(instant, 1000 + 1000);
    expect(f.plan.title).toBe('Ratios');
  });
});
