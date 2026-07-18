import { useAppState, currentScreen } from "./state/store";
import { Onboarding } from "./screens/Onboarding";
import { Home } from "./screens/Home";
import { Detail } from "./screens/Detail";
import { Concierge } from "./screens/Concierge";
import { Success } from "./screens/Success";
import { Alerts } from "./screens/Alerts";
import { Insights } from "./screens/Insights";
import { Paywall } from "./screens/Paywall";
import { Settings } from "./screens/Settings";
import { DeleteAccount } from "./screens/DeleteAccount";
import { AddSubscription } from "./screens/AddSubscription";

export function App() {
  const state = useAppState();
  const { screen, subId } = currentScreen(state);

  return (
    <div className="app">
      {screen === "onboarding" && <Onboarding />}
      {screen === "home" && <Home />}
      {screen === "detail" && <Detail subId={subId!} />}
      {screen === "concierge" && <Concierge subId={subId!} />}
      {screen === "success" && <Success subId={subId!} />}
      {screen === "alerts" && <Alerts />}
      {screen === "insights" && <Insights />}
      {screen === "paywall" && <Paywall />}
      {screen === "settings" && <Settings />}
      {screen === "deleteAccount" && <DeleteAccount />}
      {screen === "addSub" && <AddSubscription />}
    </div>
  );
}
