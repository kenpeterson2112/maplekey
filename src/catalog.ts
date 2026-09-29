// The onboarding choices: grade -> subject -> topic.
// Topics are grade-specific so each walkthrough matches what that grade actually covers.

export const GRADES = [6, 7, 8] as const;
export type Grade = (typeof GRADES)[number];

export const SUBJECTS = [
  { id: 'math', label: 'Math' },
  { id: 'science', label: 'Science' },
  { id: 'language', label: 'Language' },
] as const;
export type SubjectId = (typeof SUBJECTS)[number]['id'];

export interface Topic {
  id: string;
  label: string;
  blurb: string;
}

export const TOPICS: Record<Grade, Record<SubjectId, Topic[]>> = {
  6: {
    math: [
      { id: 'ratios', label: 'Ratios & Rates', blurb: 'Comparing quantities with ratio language' },
      { id: 'fraction-division', label: 'Dividing Fractions', blurb: 'What it means to divide by a fraction' },
      { id: 'expressions', label: 'Algebraic Expressions', blurb: 'Writing and evaluating expressions' },
      { id: 'measures-of-center', label: 'Measures of Center', blurb: 'Mean, median, and what they tell us' },
    ],
    science: [
      { id: 'water-cycle', label: 'The Water Cycle', blurb: 'How water moves and changes state' },
      { id: 'cells', label: 'Cells', blurb: 'Evidence that living things are made of cells' },
      { id: 'weather', label: 'Weather & Air Masses', blurb: 'Why the weather changes' },
      { id: 'thermal-energy', label: 'Thermal Energy', blurb: 'How heat moves between objects' },
    ],
    language: [
      { id: 'text-evidence', label: 'Citing Text Evidence', blurb: 'Backing up ideas with the text' },
      { id: 'figurative-language', label: 'Figurative Language', blurb: 'Similes, metaphors, and meaning' },
      { id: 'narrative-writing', label: 'Narrative Writing', blurb: 'Writing a story with a clear arc' },
      { id: 'central-idea', label: 'Central Idea', blurb: 'Finding what a text is mostly about' },
    ],
  },
  7: {
    math: [
      { id: 'proportional-relationships', label: 'Proportional Relationships', blurb: 'Tables, graphs, and constant of proportionality' },
      { id: 'integers', label: 'Integer Operations', blurb: 'Adding and subtracting positives and negatives' },
      { id: 'two-step-equations', label: 'Two-Step Equations', blurb: 'Solving equations in context' },
      { id: 'probability', label: 'Probability', blurb: 'Likelihood from 0 to 1' },
    ],
    science: [
      { id: 'food-webs', label: 'Ecosystems & Food Webs', blurb: 'How energy and matter move' },
      { id: 'chemical-reactions', label: 'Chemical Reactions', blurb: 'Evidence that new substances form' },
      { id: 'plate-tectonics', label: 'Plate Tectonics', blurb: 'Evidence that continents move' },
      { id: 'body-systems', label: 'Human Body Systems', blurb: 'Subsystems working together' },
    ],
    language: [
      { id: 'argument-writing', label: 'Argument Writing', blurb: 'Claims, reasons, and evidence' },
      { id: 'point-of-view', label: 'Point of View', blurb: 'How narrators shape a story' },
      { id: 'poetry-structure', label: 'Poetry Structure', blurb: 'How form creates meaning' },
      { id: 'context-clues', label: 'Context Clues', blurb: 'Figuring out unknown words' },
    ],
  },
  8: {
    math: [
      { id: 'linear-functions', label: 'Linear Functions', blurb: 'Rate of change and initial value' },
      { id: 'pythagorean-theorem', label: 'Pythagorean Theorem', blurb: 'Right triangles in the real world' },
      { id: 'systems-of-equations', label: 'Systems of Equations', blurb: 'When two lines meet' },
      { id: 'transformations', label: 'Transformations', blurb: 'Translations, reflections, rotations' },
    ],
    science: [
      { id: 'newtons-laws', label: "Newton's Laws", blurb: 'Forces, mass, and motion' },
      { id: 'waves', label: 'Waves', blurb: 'Amplitude, wavelength, and energy' },
      { id: 'natural-selection', label: 'Natural Selection', blurb: 'How populations change over time' },
      { id: 'earth-sun-moon', label: 'Earth, Sun & Moon', blurb: 'Phases, eclipses, and seasons' },
    ],
    language: [
      { id: 'theme', label: 'Theme Development', blurb: 'How a theme builds across a text' },
      { id: 'evaluating-arguments', label: 'Evaluating Arguments', blurb: 'Is the reasoning sound?' },
      { id: 'dialogue', label: 'Dialogue & Plot', blurb: 'How dialogue drives the action' },
      { id: 'research', label: 'Research Skills', blurb: 'Finding and judging credible sources' },
    ],
  },
};

export function subjectLabel(id: SubjectId): string {
  return SUBJECTS.find((s) => s.id === id)!.label;
}

export function findTopic(grade: Grade, subject: SubjectId, topicId: string): Topic | undefined {
  return TOPICS[grade][subject].find((t) => t.id === topicId);
}

export function walkthroughKey(grade: Grade, subject: SubjectId, topicId: string): string {
  return `${grade}-${subject}-${topicId}`;
}
