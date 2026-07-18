import { useState } from "react";
import { useAppState, useDispatch } from "../state/store";

const FEATURES = [
  ["Unlimited subscription tracking", "Free stops at 5 — Pro watches them all"],
  ["Automatic bank & email sync", "New charges detected the day they appear"],
  ["Cancel-for-me concierge", "We do the annoying cancellations for you"],
  ["Price-hike & trial alerts", "Never get surprise-charged again"],
];

export function Paywall() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");

  const start = () => {
    dispatch({ type: "upgradePro" });
    dispatch({ type: "back" });
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
        <button
          className={"pw-pl" + (plan === "monthly" ? " on" : "")}
          onClick={() => setPlan("monthly")}
        >
          <div className="per">Monthly</div>
          <div className="amt">$5.99</div>
          <div className="note">per month</div>
        </button>
        <button
          className={"pw-pl" + (plan === "yearly" ? " on" : "")}
          onClick={() => setPlan("yearly")}
        >
          <span className="tag">SAVE 44% · BEST</span>
          <div className="per">Yearly</div>
          <div className="amt">$39.99</div>
          <div className="note">$3.33 / month</div>
        </button>
      </div>

      <div className="sfx">
        <button className="btn pri" data-testid="start-trial" onClick={start}>
          {state.isPro ? "You're on Pro ✓" : "Start 7-day free trial"}
        </button>
        <div className="pw-restore">
          Then {plan === "yearly" ? "$39.99/yr" : "$5.99/mo"} · cancel anytime ·
          Restore purchase
        </div>
      </div>
    </div>
  );
}
