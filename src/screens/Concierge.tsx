import { useEffect, useState } from "react";
import { useAppState, useDispatch } from "../state/store";
import { formatMoney, monthlyCost } from "../domain/money";
import { yearlySavingOf } from "../domain/savings";

const STEPS = [
  "Request received",
  "Contacting provider",
  "Confirming cancellation",
  "Done — you're safe",
];

/** Ms between concierge steps. Short so the flow feels live but testable. */
const STEP_MS = 550;

export function Concierge({ subId }: { subId: string }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const sub = state.subs.find((s) => s.id === subId);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!sub) return;
    if (step >= STEPS.length - 1) {
      // Final step reached: commit the cancellation, then show the win.
      const done = setTimeout(() => {
        dispatch({ type: "cancelSub", id: sub.id });
        dispatch({ type: "navigate", screen: "success", subId: sub.id });
      }, STEP_MS);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [step, sub, dispatch]);

  if (!sub) return null;

  const progress = Math.min(step + 1, STEPS.length) / STEPS.length;
  const ringDeg = Math.round(progress * 360);

  return (
    <div className="screen" data-testid="concierge">
      <div className="cc-top">
        <div
          className="cc-ring"
          style={{
            background: `conic-gradient(var(--ac) 0deg ${ringDeg}deg, rgba(255,255,255,.1) ${ringDeg}deg 360deg)`,
          }}
        >
          <div className="in">✂️</div>
        </div>
        <div className="cc-h">Cancelling {sub.name.split(" ")[0]}…</div>
        <div className="cc-p">
          Sit back — we're taking care of it. You'll get a confirmation the
          moment it's done.
        </div>
      </div>

      <div className="cc-steps">
        {STEPS.map((label, i) => {
          const done = i < step;
          const now = i === step;
          return (
            <div key={label} className={"cc-s" + (i > step ? " pending" : "")}>
              <span className={"dot " + (done ? "done" : now ? "now" : "todo")}>
                {done ? "✓" : now ? "●" : i + 1}
              </span>
              <span className={"line" + (done ? " fill" : "")} />
              <span className="tx">{label}</span>
              {now && <span className="tm">now</span>}
              {done && <span className="tm">done</span>}
            </div>
          );
        })}
      </div>

      <div className="cc-save">
        <div className="k">You'll stop paying</div>
        <div className="v">
          {formatMoney(monthlyCost(sub))}
          <small> /mo · {formatMoney(yearlySavingOf(sub), { cents: false })} /yr</small>
        </div>
      </div>
    </div>
  );
}
