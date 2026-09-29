# MapleKey

Teacher onboarding: pick a grade, a subject, and a topic, watch a pre-scripted walkthrough of a teacher planning that exact lesson, then plan your own.

```
npm install
npm run dev      # http://localhost:5173
npm test         # content checks + timeline tests
npm run build
```

## The flow

1. **Which grade do you teach?** 6, 7, or 8
2. **Which subject do you teach?** Math, Science, or Language
3. **Which topic do you want to teach?** Four grade-specific topics per subject (`src/catalog.ts`)
4. **Walkthrough.** A teacher narrates each choice while the lesson plan types itself into the planner. Teachers can pause, skip steps, change speed (1×, 1.5×, 2×), or skip the walkthrough entirely.
5. **"Now you do it."** The teacher lands in the same planner, now empty and editable, labeled with their grade, subject, and topic. Their choice and draft are saved locally, so returning teachers go straight back to their plan.

## How walkthroughs work

Walkthroughs aren't videos. Each one is a small JSON script in `src/walkthroughs/content/`, named `<grade>-<subject>-<topic>.json`:

```json
{
  "grade": 7, "subject": "science", "topic": "plate-tectonics",
  "teacher": "Ms. Johnson",
  "intro": "…",
  "beats": [
    { "field": "title", "narration": "Why I chose this title…", "text": "Continental Detectives: Plate Tectonics" },
    { "field": "standard", "narration": "…", "text": "MS-ESS2-3" }
  ],
  "outro": "…"
}
```

A single player (`WalkthroughPlayer.tsx`) animates any script inside the real `LessonPlanner` component. Because of this:

- **Adding a walkthrough means adding a JSON file.** You don't need to change code, record video, or re-render anything. The registry finds new files automatically with `import.meta.glob`.
- **It scales.** Each script is split into its own chunk of about 1 KB gzipped, and only the one a teacher picks is downloaded, so going from 36 walkthroughs to 1,000 doesn't slow down the app.
- **Changing the planner UI updates every walkthrough automatically.** Nothing has to be re-recorded.
- The timeline (`timeline.ts`) is a pure function of elapsed time, which is what makes pause, speed changes, and step skipping work. It also respects `prefers-reduced-motion`.

To add a topic, add it to `src/catalog.ts` and add its matching JSON file. `npm test` fails if a topic has no walkthrough, if a file doesn't match any topic, or if a script leaves any planner section empty. If a walkthrough is missing at runtime, the teacher goes straight to the planner.
