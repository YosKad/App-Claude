import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { Subscription } from "../domain/types";
import { SEED_SUBSCRIPTIONS, TODAY } from "../data/seed";

export type ScreenName =
  | "onboarding"
  | "home"
  | "detail"
  | "concierge"
  | "success"
  | "alerts"
  | "insights"
  | "paywall"
  | "settings";

/** Root tabs reachable from the bottom bar. */
export const ROOT_TABS: ScreenName[] = ["home", "alerts", "insights", "settings"];

export interface Settings {
  trialAlerts: boolean;
  hikeAlerts: boolean;
  unusedNudges: boolean;
  faceId: boolean;
}

export type SettingKey = keyof Settings;

export interface AppState {
  today: string;
  subs: Subscription[];
  settings: Settings;
  isPro: boolean;
  onboarded: boolean;
  /** Navigation stack; last entry is the visible screen. */
  stack: { screen: ScreenName; subId?: string }[];
  /** Id of the most recently cancelled sub, for the success screen. */
  lastCancelled: string | null;
}

export type Action =
  | { type: "onboard" }
  | { type: "navigate"; screen: ScreenName; subId?: string }
  | { type: "back" }
  | { type: "selectTab"; screen: ScreenName }
  | { type: "cancelSub"; id: string }
  | { type: "restoreSub"; id: string }
  | { type: "toggleSetting"; key: SettingKey }
  | { type: "upgradePro" };

export const initialState: AppState = {
  today: TODAY,
  subs: SEED_SUBSCRIPTIONS,
  settings: {
    trialAlerts: true,
    hikeAlerts: true,
    unusedNudges: false,
    faceId: true,
  },
  isPro: false,
  onboarded: false,
  stack: [{ screen: "onboarding" }],
  lastCancelled: null,
};

function setStatus(
  subs: Subscription[],
  id: string,
  status: Subscription["status"],
): Subscription[] {
  return subs.map((s) => (s.id === id ? { ...s, status } : s));
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "onboard":
      return { ...state, onboarded: true, stack: [{ screen: "home" }] };

    case "navigate":
      return {
        ...state,
        stack: [...state.stack, { screen: action.screen, subId: action.subId }],
      };

    case "back":
      return state.stack.length > 1
        ? { ...state, stack: state.stack.slice(0, -1) }
        : state;

    case "selectTab":
      // Switching tabs resets the stack to that root — standard tab behaviour.
      return { ...state, stack: [{ screen: action.screen }] };

    case "cancelSub":
      return {
        ...state,
        subs: setStatus(state.subs, action.id, "cancelled"),
        lastCancelled: action.id,
      };

    case "restoreSub":
      return { ...state, subs: setStatus(state.subs, action.id, "active") };

    case "toggleSetting":
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.key]: !state.settings[action.key],
        },
      };

    case "upgradePro":
      return { ...state, isPro: true };

    default:
      return state;
  }
}

/** The screen currently on top of the stack. */
export function currentScreen(state: AppState): {
  screen: ScreenName;
  subId?: string;
} {
  return state.stack[state.stack.length - 1];
}

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<Dispatch<Action> | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useAppState(): AppState {
  const s = useContext(StateCtx);
  if (!s) throw new Error("useAppState must be used within StoreProvider");
  return s;
}

export function useDispatch(): Dispatch<Action> {
  const d = useContext(DispatchCtx);
  if (!d) throw new Error("useDispatch must be used within StoreProvider");
  return d;
}
