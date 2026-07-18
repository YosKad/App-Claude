import { useDispatch } from "../state/store";

export function Onboarding() {
  const dispatch = useDispatch();
  const start = () => dispatch({ type: "onboard" });

  return (
    <div className="screen">
      <div className="on-hero">
        <div className="on-mark">
          <span className="sh">🛡️</span>SubSentry
        </div>
        <div className="on-h1">
          Stop paying for subscriptions you <b>forgot about</b>.
        </div>
        <div className="on-p">
          SubSentry watches all your subscriptions and warns you before a free
          trial ever charges you.
        </div>
        <div className="on-stat">
          <span className="big">$217</span>
          <span className="tx">
            is what the average person finds in forgotten subscriptions each
            year.
          </span>
        </div>
      </div>
      <div className="sfx">
        <button className="btn pri" onClick={start}>
          📧 Connect email
        </button>
        <button className="btn ghost" onClick={start}>
          🏦 Connect bank securely
        </button>
        <div className="on-sec">
          🔒 Read-only access. We can never move your money.
        </div>
      </div>
    </div>
  );
}
