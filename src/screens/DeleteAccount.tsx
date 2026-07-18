import { useDispatch } from "../state/store";

/**
 * Account & data deletion. Apple (5.1.1(v)) and Google both require an in-app
 * path to delete the account and its data. This screen states plainly what gets
 * erased and requires an explicit confirmation.
 */
export function DeleteAccount() {
  const dispatch = useDispatch();

  return (
    <div className="screen">
      <div className="appbar">
        <button className="bk" aria-label="Back" onClick={() => dispatch({ type: "back" })}>
          ‹
        </button>
        Delete account
      </div>

      <div className="da-wrap">
        <div className="da-icon">🗑️</div>
        <div className="da-h">Delete your account &amp; data?</div>
        <div className="da-p">
          This permanently erases everything SubSentry holds for you. It can't be
          undone.
        </div>

        <div className="da-list">
          <div className="da-r">
            <span>🔌</span>Disconnects your linked email &amp; bank accounts
          </div>
          <div className="da-r">
            <span>🗂️</span>Deletes your subscriptions, alerts &amp; history
          </div>
          <div className="da-r">
            <span>🧾</span>Removes your saved cancellation records
          </div>
          <div className="da-r">
            <span>💳</span>Your Pro subscription is managed by the App Store — cancel
            it there to stop billing
          </div>
        </div>
      </div>

      <div className="sfx">
        <button
          className="btn dang"
          data-testid="confirm-delete"
          onClick={() => dispatch({ type: "deleteAccount" })}
        >
          Delete everything
        </button>
        <button className="btn dark" onClick={() => dispatch({ type: "back" })}>
          Keep my account
        </button>
      </div>
    </div>
  );
}
