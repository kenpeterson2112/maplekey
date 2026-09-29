import { useEffect, useState } from 'react';
import { ChoiceStep } from './components/ChoiceStep';
import { LessonPlanner } from './components/LessonPlanner';
import { WalkthroughPlayer } from './components/WalkthroughPlayer';
import { findTopic, GRADES, SUBJECTS, subjectLabel, TOPICS, type Grade, type SubjectId } from './catalog';
import { loadOnboarding, loadPlan, saveOnboarding, savePlan } from './lib/storage';
import { loadWalkthrough } from './walkthroughs/registry';
import { EMPTY_PLAN, type LessonPlan, type WalkthroughScript } from './walkthroughs/types';

type Screen =
  | { name: 'grade' }
  | { name: 'subject'; grade: Grade }
  | { name: 'topic'; grade: Grade; subject: SubjectId }
  | { name: 'watch'; grade: Grade; subject: SubjectId; topic: string }
  | { name: 'plan'; grade: Grade; subject: SubjectId; topic: string };

function initialScreen(): Screen {
  const saved = loadOnboarding();
  if (saved && findTopic(saved.grade, saved.subject, saved.topic)) return { name: 'plan', ...saved };
  return { name: 'grade' };
}

export function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">🍁 MapleKey</span>
      </header>
      <main>
        {screen.name === 'grade' && (
          <ChoiceStep
            step={1}
            totalSteps={3}
            question="Which grade do you teach?"
            columns={3}
            options={GRADES.map((g) => ({ id: String(g), label: `${g}th grade` }))}
            onChoose={(id) => setScreen({ name: 'subject', grade: Number(id) as Grade })}
          />
        )}
        {screen.name === 'subject' && (
          <ChoiceStep
            step={2}
            totalSteps={3}
            question="Which subject do you teach?"
            columns={3}
            options={SUBJECTS.map((s) => ({ id: s.id, label: s.label }))}
            onChoose={(id) => setScreen({ name: 'topic', grade: screen.grade, subject: id as SubjectId })}
            onBack={() => setScreen({ name: 'grade' })}
          />
        )}
        {screen.name === 'topic' && (
          <ChoiceStep
            step={3}
            totalSteps={3}
            question="Which topic do you want to teach?"
            columns={2}
            options={TOPICS[screen.grade][screen.subject].map((t) => ({ id: t.id, label: t.label, hint: t.blurb }))}
            onChoose={(topic) => setScreen({ name: 'watch', grade: screen.grade, subject: screen.subject, topic })}
            onBack={() => setScreen({ name: 'subject', grade: screen.grade })}
          />
        )}
        {screen.name === 'watch' && (
          <Watch
            {...screen}
            onFinish={() => {
              const choice = { grade: screen.grade, subject: screen.subject, topic: screen.topic };
              saveOnboarding(choice);
              setScreen({ name: 'plan', ...choice });
            }}
          />
        )}
        {screen.name === 'plan' && (
          <Planner
            {...screen}
            onRewatch={() => setScreen({ ...screen, name: 'watch' })}
            onStartOver={() => {
              saveOnboarding(null);
              savePlan(null);
              setScreen({ name: 'grade' });
            }}
          />
        )}
      </main>
    </div>
  );
}

function Watch({
  grade,
  subject,
  topic,
  onFinish,
}: {
  grade: Grade;
  subject: SubjectId;
  topic: string;
  onFinish: () => void;
}) {
  const [script, setScript] = useState<WalkthroughScript | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadWalkthrough(grade, subject, topic).then(
      (s) => !cancelled && setScript(s),
      () => !cancelled && setScript(null),
    );
    return () => {
      cancelled = true;
    };
  }, [grade, subject, topic]);

  const topicLabel = findTopic(grade, subject, topic)?.label ?? topic;

  if (script === undefined) return <p className="loading">Loading walkthrough…</p>;
  if (script === null) {
    // No walkthrough authored for this combination yet: skip straight to planning.
    return (
      <section className="choice-step">
        <h1>Let's plan {topicLabel}.</h1>
        <p>We don't have a walkthrough for this lesson yet, but your planner is ready.</p>
        <button className="primary" onClick={onFinish}>
          Start planning →
        </button>
      </section>
    );
  }
  return <WalkthroughPlayer script={script} topicLabel={topicLabel} onFinish={onFinish} />;
}

function Planner({
  grade,
  subject,
  topic,
  onRewatch,
  onStartOver,
}: {
  grade: Grade;
  subject: SubjectId;
  topic: string;
  onRewatch: () => void;
  onStartOver: () => void;
}) {
  const [plan, setPlan] = useState<LessonPlan>(loadPlan);
  const update = (field: keyof LessonPlan, value: string) => {
    const next = { ...plan, [field]: value };
    setPlan(next);
    savePlan(next);
  };
  const filled = Object.values(plan).filter((v) => v.trim()).length;
  const total = Object.keys(EMPTY_PLAN).length;

  return (
    <section className="plan-screen">
      <div className="plan-header">
        <div>
          <div className="chips">
            <span className="chip">Grade {grade}</span>
            <span className="chip">{subjectLabel(subject)}</span>
            <span className="chip">{findTopic(grade, subject, topic)?.label}</span>
          </div>
          <h1>Your lesson plan</h1>
          <p className="muted">
            {filled} of {total} sections filled in
          </p>
        </div>
        <div className="plan-actions">
          <button onClick={onRewatch}>↺ Rewatch walkthrough</button>
          <button
            className="link-button"
            onClick={() => {
              if (filled === 0 || confirm('Start over with a new topic? This clears your current plan.')) onStartOver();
            }}
          >
            Pick a different topic
          </button>
        </div>
      </div>
      <div className="stage">
        <LessonPlanner plan={plan} onChange={update} />
      </div>
    </section>
  );
}
