import { describe, expect, it } from 'vitest';
import { GRADES, SUBJECTS, TOPICS, walkthroughKey } from '../catalog';
import { PLAN_FIELDS, type WalkthroughScript } from './types';

const modules = import.meta.glob<WalkthroughScript>('./content/*.json', { eager: true, import: 'default' });
const scripts = new Map(
  Object.entries(modules).map(([file, script]) => [file.replace(/^\.\/content\/|\.json$/g, ''), script]),
);

describe('walkthrough content', () => {
  const combos = GRADES.flatMap((g) =>
    SUBJECTS.flatMap((s) => TOPICS[g][s.id].map((t) => ({ grade: g, subject: s.id, topic: t.id }))),
  );

  it('offers four topics for every grade and subject', () => {
    for (const g of GRADES) for (const s of SUBJECTS) expect(TOPICS[g][s.id]).toHaveLength(4);
  });

  it.each(combos)('has a walkthrough for grade $grade $subject / $topic', ({ grade, subject, topic }) => {
    const script = scripts.get(walkthroughKey(grade, subject, topic));
    expect(script).toBeDefined();
    expect(script).toMatchObject({ grade, subject, topic });
  });

  it('has no orphan walkthrough files', () => {
    const keys = new Set(combos.map((c) => walkthroughKey(c.grade, c.subject, c.topic)));
    expect([...scripts.keys()].filter((k) => !keys.has(k))).toEqual([]);
  });

  it.each([...scripts.entries()])('%s fills every planner section with narration', (_, script) => {
    expect(script.teacher && script.intro && script.outro).toBeTruthy();
    expect(script.beats.map((b) => b.field).sort()).toEqual(PLAN_FIELDS.map((f) => f.id).sort());
    for (const b of script.beats) {
      expect(b.text.trim()).not.toBe('');
      expect(b.narration.trim()).not.toBe('');
    }
  });
});
