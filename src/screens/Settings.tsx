import { useAppState, useDispatch, type SettingKey } from "../state/store";
import { TabBar } from "../components/TabBar";

const TOGGLES: { key: SettingKey; icon: string; label: string }[] = [
  { key: "trialAlerts", icon: "⏳", label: "Trial-ending alerts" },
  { key: "hikeAlerts", icon: "📈", label: "Price-hike alerts" },
  { key: "unusedNudges", icon: "👻", label: "Unused subscription nudges" },
];

export function Settings() {
  const state = useAppState();
  const dispatch = useDispatch();

  return (
    <div className="screen has-tabs">
      <div className="se-h">Settings</div>

      <div className="se-prof">
        <div className="av">Y</div>
        <div>
          <div className="nm">Yos</div>
          <div className="em">yoskadtl@gmail.com</div>
        </div>
        <div className={"pro" + (state.isPro ? "" : " free")}>
          {state.isPro ? "PRO" : "FREE"}
        </div>
      </div>

      <div className="se-g">Connected accounts</div>
      <div className="se-card">
        <div className="se-r">
          <span className="ic">📧</span>
          <div>
            <div className="rt">Gmail</div>
            <div className="rs">Synced 2 min ago</div>
          </div>
          <span className="ok">Connected</span>
        </div>
        <div className="se-r">
          <span className="ic">🏦</span>
          <div>
            <div className="rt">Chase Bank</div>
            <div className="rs">Read-only · 3 cards</div>
          </div>
          <span className="ok">Connected</span>
        </div>
      </div>

      <div className="se-g">Notifications</div>
      <div className="se-card">
        {TOGGLES.map((t) => (
          <div className="se-r" key={t.key}>
            <span className="ic">{t.icon}</span>
            <div>
              <div className="rt">{t.label}</div>
            </div>
            <button
              className={"tgl " + (state.settings[t.key] ? "on" : "off")}
              role="switch"
              aria-checked={state.settings[t.key]}
              aria-label={t.label}
              data-testid={`toggle-${t.key}`}
              onClick={() => dispatch({ type: "toggleSetting", key: t.key })}
            >
              <i />
            </button>
          </div>
        ))}
      </div>

      <div className="se-g">Plan &amp; security</div>
      <div className="se-card">
        <button
          className="se-r tap"
          data-testid="open-paywall"
          onClick={() => dispatch({ type: "navigate", screen: "paywall" })}
        >
          <span className="ic">🛡️</span>
          <div>
            <div className="rt">SubSentry {state.isPro ? "Pro" : "Free"}</div>
            <div className="rs">
              {state.isPro ? "Yearly · renews Apr 2027" : "Upgrade to unlock everything"}
            </div>
          </div>
          <span className="rr">{state.isPro ? "Manage ›" : "Upgrade ›"}</span>
        </button>
        <div className="se-r">
          <span className="ic">🔒</span>
          <div>
            <div className="rt">Face ID lock</div>
          </div>
          <button
            className={"tgl " + (state.settings.faceId ? "on" : "off")}
            role="switch"
            aria-checked={state.settings.faceId}
            aria-label="Face ID lock"
            data-testid="toggle-faceId"
            onClick={() => dispatch({ type: "toggleSetting", key: "faceId" })}
          >
            <i />
          </button>
        </div>
      </div>

      <div className="se-g">Data &amp; privacy</div>
      <div className="se-card">
        <div className="se-r">
          <span className="ic">📄</span>
          <div>
            <div className="rt">Privacy policy</div>
          </div>
          <span className="rr">›</span>
        </div>
        <div className="se-r">
          <span className="ic">📤</span>
          <div>
            <div className="rt">Export my data</div>
            <div className="rs">Download everything we hold</div>
          </div>
          <span className="rr">›</span>
        </div>
        <button
          className="se-r tap"
          data-testid="open-delete"
          onClick={() => dispatch({ type: "navigate", screen: "deleteAccount" })}
        >
          <span className="ic">🗑️</span>
          <div>
            <div className="rt" style={{ color: "#fca5a5" }}>
              Delete account &amp; data
            </div>
          </div>
          <span className="rr">›</span>
        </button>
      </div>

      <TabBar active="settings" />
    </div>
  );
}
