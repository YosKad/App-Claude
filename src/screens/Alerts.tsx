import { useAppState, useDispatch } from "../state/store";
import { detectAlerts } from "../domain/alerts";
import { TabBar } from "../components/TabBar";
import type { Alert } from "../domain/types";

const ICONS: Record<Alert["kind"], string> = {
  trial_ending: "⏳",
  price_hike: "📈",
  unused: "👻",
};

export function Alerts() {
  const state = useAppState();
  const dispatch = useDispatch();
  const alerts = detectAlerts(state.subs, state.today);

  const critical = alerts.filter((a) => a.severity === "critical");
  const warning = alerts.filter((a) => a.severity === "warning");
  const info = alerts.filter((a) => a.severity === "info");

  return (
    <div className="screen has-tabs">
      <div className="al-h">
        Alerts <span>· {alerts.length}</span>
      </div>

      {alerts.length === 0 && (
        <div className="empty">
          <div className="big">🎉</div>
          <div className="t">You're all clear</div>
          <div className="p">
            No trials ending, no price hikes, nothing unused. We'll ping you the
            moment something changes.
          </div>
        </div>
      )}

      {critical.length > 0 && (
        <Group label="🔴 Needs action now" alerts={critical} />
      )}
      {warning.length > 0 && <Group label="🟠 Worth reviewing" alerts={warning} />}
      {info.length > 0 && <Group label="👻 Worth a look" alerts={info} />}

      <TabBar active="alerts" />
    </div>
  );

  function Group({ label, alerts }: { label: string; alerts: Alert[] }) {
    return (
      <>
        <div className="al-g">{label}</div>
        <div className="al-list">
          {alerts.map((a) => (
            <div key={a.id} className={"al-c " + a.severity}>
              <span className="ic">{ICONS[a.kind]}</span>
              <div className="grow">
                <div className="t1">{a.title}</div>
                <div className="t2">{a.detail}</div>
                <div className="act">
                  <button
                    className="a"
                    style={{ background: "var(--ac)", color: "#04120e" }}
                    onClick={() =>
                      dispatch({ type: "navigate", screen: "detail", subId: a.subId })
                    }
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
}
