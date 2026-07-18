import { useState } from "react";
import { useAppState, useDispatch } from "../state/store";
import { billingService, PRODUCTS, type PlanId } from "../services/billing";

const FEATURES = [
  ["Unlimited subscription tracking", "Free stops at 5 — Pro watches them all"],
  ["Automatic bank & email sync", "New charges detected the day they appear"],
  ["Cancel-for-me concierge", "We do the annoying cancellations for you"],
  ["Price-hike & trial alerts", "Never get surprise-charged again"],
];

export function Paywall() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [plan, setPlan] = useState<PlanId>("pro_yearly");
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selected = PRODUCTS.find((p) => p.id === plan)!;

  const buy = async () => {
    if (busy) return;
    setMessage(null);
    setBusy("buy");
    const r = await billingService.purchase(plan);
    setBusy(null);
    if (r.ok) {
      dispatch({ type: "upgradePro" });
      dispatch({ type: "back" });
    } else if (r.phase === "cancelled") {
      setMessage(null); // user backed out — say nothing
    } else {
      setMessage(r.reason ?? "Something went wrong. You were not charged.");
    }
  };

  const restore = async () => {
    if (busy) return;
    setMessage(null);
    setBusy("restore");
    const r = await billingService.restore();
    setBusy(null);
    if (r.ok) {
      dispatch({ type: "upgradePro" });
      dispatch({ type: "back" });
    } else {
      setMessage(r.reason ?? "No previous purchase found.");
    }
  };

  return (
    <div className="screen">
      <div className="appbar">
        <button className="bk" aria-label="Close" onClick={() => dispatch({ type: "back" })}>
          ‹
        </button>
      </div>
      <div className="pw-top">
        <span className="pw-badge">🛡️ SubSentry Pro</span>
        <div className="pw-h">
          Unlock the <b>full guard</b>
        </div>
        <div className="pw-p">
          Members save $217/yr — Pro pays for itself in week one.
        </div>
      </div>

      <div className="pw-feats">
        {FEATURES.map(([t, d]) => (
          <div className="pw-f" key={t}>
            <span className="ck">✓</span>
            <span className="ft">
              {t}
              <span>{d}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="pw-plans">
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            className={"pw-pl" + (plan === p.id ? " on" : "")}
            data-testid={`plan-${p.id}`}
            aria-pressed={plan === p.id}
            onClick={() => setPlan(p.id)}
          >
            {p.badge && <span className="tag">{p.badge}</span>}
            <div className="per">{p.title}</div>
            <div className="amt">{p.price}</div>
            <div className="note">{p.perMonth ?? p.period}</div>
          </button>
        ))}
      </div>

      {message && (
        <div className="pw-msg" data-testid="pw-message" role="alert">
          {message}
        </div>
      )}

      <div className="sfx">
        <button
          className="btn pri"
          data-testid="start-trial"
          disabled={busy !== null}
          onClick={buy}
        >
          {state.isPro
            ? "You're on Pro ✓"
            : busy === "buy"
              ? "Processing…"
              : `Start ${selected.trialDays}-day free trial`}
        </button>
        <button
          className="pw-restore"
          data-testid="restore"
          disabled={busy !== null}
          onClick={restore}
        >
          <u>{busy === "restore" ? "Restoring…" : "Restore purchase"}</u>
        </button>
        <div className="pw-terms">
          {selected.trialDays}-day free trial, then {selected.price}
          {selected.perMonth ? "/year" : "/month"}. Auto-renews until cancelled;
          manage or cancel anytime in your App Store account. <u>Terms</u> ·{" "}
          <u>Privacy</u>
        </div>
      </div>
    </div>
  );
}
