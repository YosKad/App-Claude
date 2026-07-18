import { useAppState, useDispatch } from "../state/store";
import { formatMoney } from "../domain/money";
import { relativeDue, relativeUsed } from "../domain/dates";
import { detectHike } from "../domain/alerts";
import type { Subscription } from "../domain/types";

export function Detail({ subId }: { subId: string }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const sub = state.subs.find((s) => s.id === subId);

  if (!sub) {
    return (
      <div className="screen">
        <Bar title="Subscription" />
        <div className="empty">
          <div className="t">Not found</div>
        </div>
      </div>
    );
  }

  const cancelled = sub.status === "cancelled";

  return (
    <div className="screen">
      <Bar title="Subscription" />
      <div className="dt-head">
        <span className="logo" style={{ background: sub.color }}>
          {sub.glyph || sub.name[0]}
        </span>
        <div className="nm">{sub.name}</div>
        <div className="pr">
          {formatMoney(sub.price)} / {sub.cycle === "yearly" ? "year" : "month"}
        </div>
        <StatusPill sub={sub} today={state.today} />
      </div>

      {sub.priceHistory.length >= 2 && <PriceHistory sub={sub} />}

      <div className="dt-rows">
        <Row
          k="Next charge"
          v={
            cancelled
              ? "None — cancelled"
              : `${relativeDue(sub.nextCharge, state.today)} · ${formatMoney(sub.price)}`
          }
          red={!cancelled && sub.status === "trial"}
        />
        <Row k="Started" v={sub.startedOn} />
        <Row k="Category" v={sub.category} />
        <Row k="Last opened" v={relativeUsed(sub.lastUsed, state.today)} />
      </div>

      <div className="sfx">
        {cancelled ? (
          <button
            className="btn pri"
            onClick={() => dispatch({ type: "restoreSub", id: sub.id })}
          >
            Reactivate subscription
          </button>
        ) : (
          <>
            <button
              className="btn dang"
              data-testid="cancel-cta"
              onClick={() =>
                dispatch({ type: "navigate", screen: "concierge", subId: sub.id })
              }
            >
              ✂️ Cancel this for me
            </button>
            <div className="dt-row2">
              <button className="btn ghost">⏰ Remind me</button>
              <button
                className="btn dark"
                onClick={() => dispatch({ type: "back" })}
              >
                Keep it
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Bar({ title }: { title: string }) {
  const dispatch = useDispatch();
  return (
    <div className="appbar">
      <button className="bk" aria-label="Back" onClick={() => dispatch({ type: "back" })}>
        ‹
      </button>
      {title}
    </div>
  );
}

function StatusPill({ sub, today }: { sub: Subscription; today: string }) {
  if (sub.status === "cancelled")
    return <span className="dt-pill gone">Cancelled</span>;
  if (sub.status === "trial")
    return (
      <span className="dt-pill crit">
        ⚠ Trial ends {relativeDue(sub.nextCharge, today)}
      </span>
    );
  return <span className="dt-pill ok">Active</span>;
}

function Row({ k, v, red }: { k: string; v: string; red?: boolean }) {
  return (
    <div className="dt-r">
      <span className="k">{k}</span>
      <span className={"v" + (red ? " red" : "")}>{v}</span>
    </div>
  );
}

function PriceHistory({ sub }: { sub: Subscription }) {
  const prices = sub.priceHistory.map((p) => p.price);
  const max = Math.max(...prices);
  const hike = detectHike(sub);
  return (
    <div className="dt-card">
      <div className="ch">Price history {hike ? `· up ${hike.percent}%` : ""}</div>
      <div className="dt-bars">
        {sub.priceHistory.map((p, i) => {
          const isNow = i === sub.priceHistory.length - 1;
          return (
            <div key={p.date} className={"b" + (isNow ? " now" : "")}>
              <i style={{ height: `${Math.round((p.price / max) * 100)}%` }} />
              <em>{formatMoney(p.price, { cents: false })}</em>
              <span>{p.date.slice(0, 4)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
