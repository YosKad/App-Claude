import { useAppState, useDispatch } from "../state/store";
import { totalMonthly, monthlyCost, formatMoney, isBilling } from "../domain/money";
import { detectAlerts, detectHike } from "../domain/alerts";
import { relativeDue } from "../domain/dates";
import { savingsSummary } from "../domain/savings";
import { Sparkline } from "../components/Sparkline";
import { TabBar } from "../components/TabBar";
import type { Subscription } from "../domain/types";

export function Home() {
  const state = useAppState();
  const dispatch = useDispatch();
  const { subs, today } = state;

  const monthly = totalMonthly(subs);
  const alerts = detectAlerts(subs, today);
  const topAlert = alerts[0];
  const billing = subs.filter(isBilling);
  const cancelled = subs.filter((s) => s.status === "cancelled");
  const saved = savingsSummary(cancelled);

  const open = (id: string) =>
    dispatch({ type: "navigate", screen: "detail", subId: id });

  return (
    <div className="screen has-tabs">
      <div className="home-bar">
        <div className="home-brand">
          <span className="hb-logo">🛡️</span>
          <span>SubSentry</span>
        </div>
        <button
          className="home-add"
          data-testid="open-add"
          aria-label="Add subscription"
          onClick={() => dispatch({ type: "navigate", screen: "addSub" })}
        >
          ＋ Add
        </button>
      </div>
      <div className="d-h">
        <div className="k">Total monthly subscriptions</div>
        <div className="row">
          <div className="v">
            {formatMoney(monthly)}
            <small> /mo</small>
          </div>
          {saved.monthly > 0 && (
            <div className="chg">↓ {formatMoney(saved.monthly)} saved</div>
          )}
        </div>
      </div>

      <div className="d-chart">
        <Sparkline />
      </div>

      {topAlert && (
        <div className="d-alert">
          <div className="ic">⚠️</div>
          <div>
            <div className="t1">{topAlert.title}</div>
            <div className="t2">{topAlert.detail}</div>
          </div>
          <button
            className="stop"
            onClick={() => open(topAlert.subId)}
          >
            Review
          </button>
        </div>
      )}

      <div className="d-sec">
        Active subscriptions <span>{billing.length} billing</span>
      </div>
      <div className="d-list">
        {subs.map((s) => (
          <SubRow key={s.id} sub={s} today={today} onClick={() => open(s.id)} />
        ))}
      </div>

      <TabBar active="home" />
    </div>
  );
}

function SubRow({
  sub,
  today,
  onClick,
}: {
  sub: Subscription;
  today: string;
  onClick: () => void;
}) {
  const hike = detectHike(sub);
  const cancelled = sub.status === "cancelled";

  let sub2: string;
  if (cancelled) sub2 = "Cancelled";
  else if (sub.status === "trial")
    sub2 = `Trial · charges ${relativeDue(sub.nextCharge, today)}`;
  else sub2 = `Renews ${relativeDue(sub.nextCharge, today)}`;

  return (
    <button
      className={"d-item" + (cancelled ? " cancelled" : "")}
      onClick={onClick}
      data-testid={`sub-${sub.id}`}
    >
      <span className="logo" style={{ background: sub.color }}>
        {sub.glyph || sub.name[0]}
      </span>
      <span>
        <span className="nn">{sub.name}</span>
        <div className="dd">{sub2}</div>
      </span>
      <span className="rt">
        <div className={"p" + (cancelled ? " strike" : "")}>
          {formatMoney(monthlyCost(sub))}
        </div>
        {sub.status === "trial" && <div className="flag">⚠ ending</div>}
        {!cancelled && hike && <div className="flag">↑ +{hike.percent}%</div>}
        {cancelled && <div className="flag gone">removed</div>}
      </span>
    </button>
  );
}
