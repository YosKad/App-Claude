import { useState } from "react";
import { useDispatch } from "../state/store";
import {
  buildSubscription,
  validateSubInput,
  type SubInput,
} from "../domain/newSubscription";
import type { BillingProvider, Category } from "../domain/types";

const CATEGORIES: Category[] = [
  "Streaming", "Music", "Fitness", "Cloud", "News", "Gaming", "Other",
];
const BILLING: { id: BillingProvider; label: string }[] = [
  { id: "card", label: "Card" },
  { id: "paypal", label: "PayPal" },
  { id: "apple", label: "Apple" },
  { id: "google", label: "Google" },
];

export function AddSubscription() {
  const dispatch = useDispatch();
  const [input, setInput] = useState<SubInput>({
    name: "",
    price: "",
    cycle: "monthly",
    category: "Streaming",
    billing: "card",
    nextCharge: "",
  });
  const [touched, setTouched] = useState(false);

  const errors = validateSubInput(input);
  const set = <K extends keyof SubInput>(k: K, v: SubInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const save = () => {
    setTouched(true);
    if (errors.length) return;
    dispatch({ type: "addSub", sub: buildSubscription(input) });
  };

  return (
    <div className="screen">
      <div className="appbar">
        <button className="bk" aria-label="Back" onClick={() => dispatch({ type: "back" })}>
          ‹
        </button>
        Add subscription
      </div>

      <div className="form">
        <label className="field">
          <span className="lab">Name</span>
          <input
            className="inp"
            data-testid="add-name"
            placeholder="e.g. Disney+"
            value={input.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="lab">Price</span>
            <div className="inp-money">
              <span>$</span>
              <input
                className="inp"
                data-testid="add-price"
                inputMode="decimal"
                placeholder="0.00"
                value={input.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
          </label>
          <label className="field">
            <span className="lab">Billing period</span>
            <div className="seg">
              {(["monthly", "yearly"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={"seg-b" + (input.cycle === c ? " on" : "")}
                  onClick={() => set("cycle", c)}
                >
                  {c === "monthly" ? "Monthly" : "Yearly"}
                </button>
              ))}
            </div>
          </label>
        </div>

        <label className="field">
          <span className="lab">Next charge date</span>
          <input
            className="inp"
            data-testid="add-date"
            type="date"
            value={input.nextCharge}
            onChange={(e) => set("nextCharge", e.target.value)}
          />
        </label>

        <label className="field">
          <span className="lab">Category</span>
          <select
            className="inp"
            value={input.category}
            onChange={(e) => set("category", e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <div className="field">
          <span className="lab">Billed through</span>
          <div className="seg">
            {BILLING.map((b) => (
              <button
                key={b.id}
                type="button"
                className={"seg-b" + (input.billing === b.id ? " on" : "")}
                onClick={() => set("billing", b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
          {(input.billing === "apple" || input.billing === "google") && (
            <div className="hint">
              Heads up: {input.billing === "apple" ? "Apple" : "Google"} subscriptions
              can only be cancelled in system settings — we'll take you there.
            </div>
          )}
        </div>

        {touched && errors.length > 0 && (
          <div className="form-err" role="alert" data-testid="add-errors">
            {errors.map((e) => (
              <div key={e}>• {e}</div>
            ))}
          </div>
        )}
      </div>

      <div className="sfx">
        <button className="btn pri" data-testid="add-save" onClick={save}>
          Add subscription
        </button>
      </div>
    </div>
  );
}
