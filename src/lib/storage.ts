import type { Grade, SubjectId } from '../catalog';
import { EMPTY_PLAN, type LessonPlan } from '../walkthroughs/types';

// Local persistence so a returning teacher lands back in their planner.
// Storage can be unavailable (private mode, blocked site data), so every
// access is guarded and the app works without it.

export interface Onboarding {
  grade: Grade;
  subject: SubjectId;
  topic: string;
}

const ONBOARDING_KEY = 'maplekey.onboarding';
const PLAN_KEY = 'maplekey.plan';

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Non-fatal: the teacher just won't resume here next visit.
  }
}

export const loadOnboarding = () => read<Onboarding>(ONBOARDING_KEY);
export const saveOnboarding = (o: Onboarding | null) => write(ONBOARDING_KEY, o);

export const loadPlan = (): LessonPlan => ({ ...EMPTY_PLAN, ...read<Partial<LessonPlan>>(PLAN_KEY) });
export const savePlan = (p: LessonPlan | null) => write(PLAN_KEY, p);
