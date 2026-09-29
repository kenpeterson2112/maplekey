interface Option {
  id: string;
  label: string;
  hint?: string;
}

interface Props {
  step: number;
  totalSteps: number;
  question: string;
  options: Option[];
  columns: number;
  onChoose: (id: string) => void;
  onBack?: () => void;
}

export function ChoiceStep({ step, totalSteps, question, options, columns, onChoose, onBack }: Props) {
  return (
    <section className="choice-step">
      <div className="step-header">
        {onBack ? (
          <button className="link-button" onClick={onBack}>
            ← Back
          </button>
        ) : (
          <span />
        )}
        <span className="step-count">
          Step {step} of {totalSteps}
        </span>
      </div>
      <div className="progress" aria-hidden>
        {Array.from({ length: totalSteps }, (_, i) => (
          <span key={i} className={i < step ? 'progress-seg on' : 'progress-seg'} />
        ))}
      </div>
      <h1>{question}</h1>
      <div className="options" style={{ '--cols': columns } as React.CSSProperties}>
        {options.map((o) => (
          <button key={o.id} className="option" onClick={() => onChoose(o.id)}>
            <span className="option-label">{o.label}</span>
            {o.hint && <span className="option-hint">{o.hint}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}
