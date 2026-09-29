import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LessonPlanner } from './LessonPlanner';
import { beatStarts, buildTimeline, DEFAULT_PACING, frameAt, type Pacing } from '../walkthroughs/timeline';
import type { PlanFieldId, WalkthroughScript } from '../walkthroughs/types';

const SPEEDS = [1, 1.5, 2];

const REDUCED_MOTION_PACING: Pacing = { ...DEFAULT_PACING, moveMs: 0, msPerTypedChar: 0 };

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Drives elapsed time with requestAnimationFrame; the frame shown is derived from it.
function useClock(duration: number) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) * speed;
      last = now;
      setTime((t) => Math.min(t + dt, duration));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, duration]);

  useEffect(() => {
    if (time >= duration) setPlaying(false);
  }, [time, duration]);

  return { time, setTime, playing, setPlaying, speed, setSpeed };
}

interface Props {
  script: WalkthroughScript;
  topicLabel: string;
  onFinish: () => void;
}

export function WalkthroughPlayer({ script, topicLabel, onFinish }: Props) {
  const timeline = useMemo(
    () => buildTimeline(script, prefersReducedMotion() ? REDUCED_MOTION_PACING : DEFAULT_PACING),
    [script],
  );
  const starts = useMemo(() => beatStarts(timeline), [timeline]);
  const { time, setTime, playing, setPlaying, speed, setSpeed } = useClock(timeline.duration);
  const frame = frameAt(timeline, time);

  const stageRef = useRef<HTMLDivElement>(null);
  const fields = useRef(new Map<PlanFieldId, HTMLElement>());
  const setFieldRef = useCallback((id: PlanFieldId, el: HTMLElement | null) => {
    if (el) fields.current.set(id, el);
    else fields.current.delete(id);
  }, []);

  // Place the pretend cursor on the field being filled in, and keep it in view.
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const el = frame.activeField && fields.current.get(frame.activeField);
    if (!stage || !el) return setCursor(null);
    const input = el.querySelector('input, textarea') ?? el;
    const s = stage.getBoundingClientRect();
    const r = input.getBoundingClientRect();
    setCursor({ x: r.left - s.left + Math.min(r.width * 0.3, 160), y: r.top - s.top + r.height / 2 });
    el.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [frame.activeField]);

  const jumpTo = (beat: number) => {
    const clamped = Math.max(0, Math.min(beat, starts.length - 1));
    setTime(starts[clamped]);
    setPlaying(true);
  };
  const restart = () => {
    setTime(0);
    setPlaying(true);
  };

  const stepLabel =
    frame.beat < 0 ? 'Intro' : frame.beat >= script.beats.length ? 'Wrap-up' : `Step ${frame.beat + 1} of ${script.beats.length}`;
  const initials = script.teacher.replace(/^(Mr|Ms|Mrs|Dr)\.\s*/, '').slice(0, 1);

  return (
    <section className="walkthrough">
      <aside className="narration">
        <div className="teacher">
          <span className="avatar" aria-hidden>
            {initials}
          </span>
          <div>
            <div className="teacher-name">{script.teacher}</div>
            <div className="teacher-meta">
              Grade {script.grade} · {topicLabel}
            </div>
          </div>
        </div>
        <div className="step-label">{stepLabel}</div>
        <p className="bubble" aria-live="polite" key={frame.narration}>
          {frame.narration}
        </p>

        <div className="scrubber" aria-hidden>
          <div className="scrubber-fill" style={{ width: `${(time / timeline.duration) * 100}%` }} />
        </div>

        <div className="controls">
          <button onClick={() => jumpTo(frame.beat - 1)} aria-label="Previous step" disabled={frame.beat <= 0}>
            ⏮
          </button>
          {frame.done ? (
            <button onClick={restart} aria-label="Replay">
              ↺
            </button>
          ) : (
            <button onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? '⏸' : '▶'}
            </button>
          )}
          <button
            onClick={() => jumpTo(frame.beat + 1)}
            aria-label="Next step"
            disabled={frame.beat >= script.beats.length - 1}
          >
            ⏭
          </button>
          <button
            className="speed"
            onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
            aria-label="Playback speed"
          >
            {speed}×
          </button>
        </div>

        {frame.done ? (
          <div className="your-turn">
            <h2>Now you do it.</h2>
            <p>Your planner is ready — same sections, blank page. Plan your own {topicLabel.toLowerCase()} lesson.</p>
            <button className="primary" onClick={onFinish}>
              Start planning →
            </button>
          </div>
        ) : (
          <button className="link-button skip" onClick={onFinish}>
            Skip — I'm ready to plan
          </button>
        )}
      </aside>

      <div className="stage" ref={stageRef}>
        <div className="stage-chrome">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <span className="stage-title">{script.teacher}'s lesson plan</span>
        </div>
        <LessonPlanner plan={frame.plan} activeField={frame.activeField} typing={frame.typing} fieldRef={setFieldRef} />
        {cursor && (
          <div
            className={frame.typing ? 'fake-cursor typing' : 'fake-cursor'}
            style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
            aria-hidden
          />
        )}
      </div>
    </section>
  );
}
