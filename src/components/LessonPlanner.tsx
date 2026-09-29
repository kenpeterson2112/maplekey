import { PLAN_FIELDS, type LessonPlan, type PlanFieldId } from '../walkthroughs/types';

interface Props {
  plan: LessonPlan;
  onChange?: (field: PlanFieldId, value: string) => void;
  activeField?: PlanFieldId | null;
  typing?: boolean;
  fieldRef?: (field: PlanFieldId, el: HTMLElement | null) => void;
}

// The lesson planner. The walkthrough plays inside this exact component
// (read-only), so what teachers watch is what they then fill in themselves.
export function LessonPlanner({ plan, onChange, activeField, typing, fieldRef }: Props) {
  const readOnly = !onChange;
  return (
    <form className="planner" onSubmit={(e) => e.preventDefault()}>
      {PLAN_FIELDS.map((f) => {
        const active = f.id === activeField;
        const common = {
          id: `plan-${f.id}`,
          value: plan[f.id],
          placeholder: f.placeholder,
          readOnly,
          tabIndex: readOnly ? -1 : undefined,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange?.(f.id, e.target.value),
          className: ['field-input', active && 'active', active && typing && 'typing'].filter(Boolean).join(' '),
        };
        return (
          <div key={f.id} className={f.multiline ? 'field' : 'field short'} ref={(el) => fieldRef?.(f.id, el)}>
            <label htmlFor={common.id}>{f.label}</label>
            {f.multiline ? <textarea rows={3} {...common} /> : <input type="text" {...common} />}
          </div>
        );
      })}
    </form>
  );
}
