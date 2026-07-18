import { useAppState, useDispatch } from "../state/store";
import { formatMoney } from "../domain/money";
import { savingsSummary, yearlySavingOf } from "../domain/savings";

export function Success({ subId }: { subId: string }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const sub = state.subs.find((s) => s.id === subId);
  const cancelled = state.subs.filter((s) => s.status === "cancelled");
  const saved = savingsSummary(cancelled);
  const thisYearSaving = sub ? yearlySavingOf(sub) : 0;
  const receipt = state.lastCancellation;
  const methodLabel: Record<string, string> = {
    concierge: "Cancelled by our team",
    provider_api: "Cancelled via provider",
    rpa: "Cancelled automatically",
    store_deeplink: "Confirmed in settings",
  };

  return (
    <div className="screen" data-testid="success">
      <div className="su-wrap">
        <div className="su-check">✓</div>
        <div className="su-h">{sub ? `${sub.name.split(" ")[0]} cancelled` : "Cancelled"}</div>
        <div className="su-p">
          Done and confirmed. You won't be charged again — we've got the receipt.
        </div>
        {receipt?.confirmationId && (
          <div className="su-receipt" data-testid="receipt">
            ✓ {methodLabel[receipt.method]} · ref {receipt.confirmationId}
          </div>
        )}
        <div className="su-big">
          <div className="k">You just saved</div>
          <div className="v">
            {formatMoney(thisYearSaving, { cents: false })}
            <small>/year</small>
          </div>
        </div>
        <div className="su-tot">
          <div className="t">
            <div className="tv">{formatMoney(saved.yearly, { cents: false })}</div>
            <div className="tk">Saved this year</div>
          </div>
          <div className="t">
            <div className="tv">{saved.count}</div>
            <div className="tk">Subs cancelled</div>
          </div>
        </div>
      </div>
      <div className="sfx">
        <button
          className="btn pri"
          data-testid="success-home"
          onClick={() => dispatch({ type: "selectTab", screen: "home" })}
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
