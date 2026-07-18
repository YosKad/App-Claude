import { useEffect, useRef, useState } from "react";
import { useAppState, useDispatch } from "../state/store";
import { formatMoney, monthlyCost } from "../domain/money";
import { yearlySavingOf } from "../domain/savings";
import {
  cancellationService,
  type CancellationEvent,
  type CancellationOutcome,
  type CancellationPhase,
} from "../services/cancellation";

const STEP_LABELS: Record<
  Exclude<CancellationPhase, "confirmed" | "needs_user" | "failed">,
  string
> = {
  queued: "Request received",
  contacting: "Contacting provider",
  confirming: "Confirming cancellation",
};
const ORDER: CancellationPhase[] = ["queued", "contacting", "confirming"];

export function Concierge({ subId }: { subId: string }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const sub = state.subs.find((s) => s.id === subId);

  const [events, setEvents] = useState<CancellationEvent[]>([]);
  const [outcome, setOutcome] = useState<CancellationOutcome | null>(null);
  const started = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    // `mounted` tracks the true lifecycle (survives StrictMode's dev remount,
    // flips false only on a real unmount). `started` ensures the request fires
    // exactly once.
    mounted.current = true;
    if (sub && !started.current) {
      started.current = true;
      cancellationService
        .cancel(sub, (e) => {
          if (mounted.current) setEvents((prev) => [...prev, e]);
        })
        .then((result) => {
          if (!mounted.current) return;
          setOutcome(result);
          if (result.ok && result.phase === "confirmed") {
            // Only now do we actually mark it cancelled in app state.
            dispatch({
              type: "cancelSub",
              id: sub.id,
              method: result.method,
              confirmationId: result.confirmationId,
            });
            setTimeout(() => {
              if (mounted.current)
                dispatch({ type: "navigate", screen: "success", subId: sub.id });
            }, 600);
          }
        });
    }
    return () => {
      mounted.current = false;
    };
  }, [sub, dispatch]);

  if (!sub) return null;

  const currentPhase = events[events.length - 1]?.phase ?? "queued";
  const progressed = ORDER.indexOf(
    (["confirmed", "needs_user", "failed"] as CancellationPhase[]).includes(
      currentPhase,
    )
      ? "confirming"
      : currentPhase,
  );
  const isDone = outcome !== null;
  const ringDeg = Math.round(((progressed + 1) / (ORDER.length + 1)) * 360);
  const failed = outcome?.phase === "failed";
  const needsUser = outcome?.phase === "needs_user";

  const ringColor = failed
    ? "var(--danger)"
    : needsUser
      ? "var(--warn)"
      : "var(--ac)";

  return (
    <div className="screen" data-testid="concierge">
      <div className="cc-top">
        <div
          className="cc-ring"
          style={{
            background: `conic-gradient(${ringColor} 0deg ${
              isDone ? 360 : ringDeg
            }deg, rgba(255,255,255,.1) ${isDone ? 360 : ringDeg}deg 360deg)`,
          }}
        >
          <div className="in">{failed ? "⚠️" : needsUser ? "👆" : "✂️"}</div>
        </div>
        <div className="cc-h">
          {failed
            ? "Couldn't cancel automatically"
            : needsUser
              ? "Almost — one tap from you"
              : `Cancelling ${sub.name.split(" ")[0]}…`}
        </div>
        <div className="cc-p">
          {outcome?.reason ??
            "Sit back — we're taking care of it. You'll get a confirmation the moment it's done."}
        </div>
      </div>

      {!isDone && (
        <div className="cc-steps">
          {ORDER.map((phase, i) => {
            const done = i < progressed;
            const now = i === progressed;
            return (
              <div key={phase} className={"cc-s" + (i > progressed ? " pending" : "")}>
                <span className={"dot " + (done ? "done" : now ? "now" : "todo")}>
                  {done ? "✓" : now ? "●" : i + 1}
                </span>
                <span className={"line" + (done ? " fill" : "")} />
                <span className="tx">{STEP_LABELS[phase as keyof typeof STEP_LABELS]}</span>
                {now && <span className="tm">now</span>}
                {done && <span className="tm">done</span>}
              </div>
            );
          })}
        </div>
      )}

      {!isDone && (
        <div className="cc-save">
          <div className="k">You'll stop paying</div>
          <div className="v">
            {formatMoney(monthlyCost(sub))}
            <small>
              {" "}
              /mo · {formatMoney(yearlySavingOf(sub), { cents: false })} /yr
            </small>
          </div>
        </div>
      )}

      {(needsUser || failed) && (
        <div className="sfx">
          {needsUser && (
            <button
              className="btn pri"
              data-testid="finish-in-settings"
              onClick={() => {
                if (outcome?.deepLink) window.open(outcome.deepLink, "_blank");
                dispatch({ type: "back" });
              }}
            >
              Open subscription settings
            </button>
          )}
          {failed && (
            <button
              className="btn pri"
              onClick={() => dispatch({ type: "back" })}
            >
              Try again later
            </button>
          )}
          <button className="btn dark" onClick={() => dispatch({ type: "back" })}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}
