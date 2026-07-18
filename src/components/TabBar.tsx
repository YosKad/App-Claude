import { useAppState, useDispatch, type ScreenName } from "../state/store";
import { detectAlerts } from "../domain/alerts";

const TABS: { screen: ScreenName; icon: string; label: string }[] = [
  { screen: "home", icon: "📊", label: "Home" },
  { screen: "alerts", icon: "🔔", label: "Alerts" },
  { screen: "insights", icon: "📈", label: "Insights" },
  { screen: "settings", icon: "⚙️", label: "Settings" },
];

export function TabBar({ active }: { active: ScreenName }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const alertCount = detectAlerts(state.subs, state.today).length;

  return (
    <nav className="tabbar" aria-label="Primary">
      {TABS.map((t) => (
        <button
          key={t.screen}
          className={"tab" + (active === t.screen ? " on" : "")}
          aria-label={t.label}
          aria-current={active === t.screen ? "page" : undefined}
          onClick={() => dispatch({ type: "selectTab", screen: t.screen })}
        >
          <span className="i">{t.icon}</span>
          {t.screen === "alerts" && alertCount > 0 && (
            <span className="badge" data-testid="alert-badge">
              {alertCount}
            </span>
          )}
          {t.label}
        </button>
      ))}
    </nav>
  );
}
