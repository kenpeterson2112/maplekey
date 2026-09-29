import type { Grade, SubjectId } from '../catalog';

// Every lesson plan — the ones teachers write and the ones the walkthroughs
// demonstrate — has the same sections, in this order.
export const PLAN_FIELDS = [
  { id: 'title', label: 'Lesson title', multiline: false, placeholder: 'Give your lesson a name' },
  { id: 'standard', label: 'Standard', multiline: false, placeholder: 'Which standard does this address?' },
  { id: 'objective', label: 'Objective', multiline: true, placeholder: 'Students will be able to…' },
  { id: 'warmUp', label: 'Warm-up', multiline: true, placeholder: 'How will you open the lesson?' },
  { id: 'instruction', label: 'Direct instruction', multiline: true, placeholder: 'What will you model or explain?' },
  { id: 'activity', label: 'Student activity', multiline: true, placeholder: 'What will students do?' },
  { id: 'exitTicket', label: 'Exit ticket', multiline: true, placeholder: 'How will you check understanding?' },
] as const;

export type PlanFieldId = (typeof PLAN_FIELDS)[number]['id'];
export type LessonPlan = Record<PlanFieldId, string>;

export const EMPTY_PLAN: LessonPlan = Object.fromEntries(
  PLAN_FIELDS.map((f) => [f.id, '']),
) as LessonPlan;

// One step of a walkthrough: the teacher says why, then types the section.
export interface Beat {
  field: PlanFieldId;
  narration: string;
  text: string;
}

// A pre-scripted walkthrough. Stored as one JSON file per grade/subject/topic
// in ./content; the player animates it inside the real lesson planner.
export interface WalkthroughScript {
  grade: Grade;
  subject: SubjectId;
  topic: string;
  teacher: string;
  intro: string;
  beats: Beat[];
  outro: string;
}
