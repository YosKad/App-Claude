import { useAppState } from "../state/store";
import { categoryBreakdown, totalMonthly, formatMoney } from "../domain/money";
import { savingsSummary } from "../domain/savings";
import { TabBar } from "../components/TabBar";
import type { Category } from "../domain/types";

const CAT_COLORS: Record<Category, string> = {
  Streaming: "#2dd4bf",
  Cloud: "#6366f1",
  Fitness: "#f59e0b",
  Music: "#ec4899",
  News: "#38bdf8",
  Gaming: "#a855f7",
  Other: "#64748b",
};

export function Insights() {
  const state = useAppState();
  const rows = categoryBreakdown(state.subs);
  const monthly = totalMonthly(state.subs);
  const saved = savingsSummary(state.subs.filter((s) => s.status === "cancelled"));

  // Build the conic-gradient stops from the breakdown.
  let acc = 0;
  const stops = rows
    .map((r) => {
      const from = acc;
      acc += r.percent;
      return `${CAT_COLORS[r.category]} ${from}% ${acc}%`;
    })
    .join(", ");

  return (
    <div className="screen has-tabs">
      <div className="in-h">Insights</div>

      <div className="in-donut">
        <div
          className="in-ring"
          style={{ background: `conic-gradient(${stops || "var(--card2) 0 100%"})` }}
        >
          <div className="in">
            <div className="v">{formatMoney(monthly, { cents: false })}</div>
            <div className="k">/ month</div>
          </div>
        </div>
        <div className="in-leg">
          {rows.map((r) => (
            <div className="l" key={r.category}>
              <span className="sw" style={{ background: CAT_COLORS[r.category] }} />
              <span className="nm">{r.category}</span>
              <span className="pc">{r.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="in-save">
        <div className="k">Saved with SubSentry</div>
        <div className="v">
          {formatMoney(saved.yearly, { cents: false })}
          <small> · {saved.count} subs cancelled</small>
        </div>
      </div>

      <div className="in-tip">
        <span className="ic">💡</span>
        <div>
          <div className="t1">Review your unused subscriptions</div>
          <div className="t2">
            Cancelling what you don't open could save you even more each month.
          </div>
        </div>
      </div>

      <TabBar active="insights" />
    </div>
  );
}
