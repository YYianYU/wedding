import { useEffect, useState } from "react";
import { Frame } from "../components/Frame.jsx";
import { WishAudio } from "../components/WishAudio.jsx";
import { useI18n } from "../i18n.jsx";
import { listPendingWishes, reviewWish } from "../wishes.js";

const KEY_STORAGE = "chen-yu-review-key";

function formatWhen(iso, lang) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(lang === "zh" ? "zh-CN" : "en-US");
}

export function Review() {
  const { lang, t } = useI18n();
  const [keyInput, setKeyInput] = useState(() => {
    try {
      return sessionStorage.getItem(KEY_STORAGE) || "";
    } catch {
      return "";
    }
  });
  const [key, setKey] = useState(keyInput);
  const [pending, setPending] = useState([]);
  const [publicCount, setPublicCount] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");

  async function load(reviewKey) {
    setLoading(true);
    setError("");
    try {
      const payload = await listPendingWishes(reviewKey);
      setPending(payload.pending);
      setPublicCount(payload.publicCount);
      if (payload.notice) setNotice(payload.notice);
      try {
        sessionStorage.setItem(KEY_STORAGE, reviewKey);
      } catch {
        /* keep the key for this visit only */
      }
    } catch {
      setPending([]);
      setError("reviewFailed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!key) return undefined;
    load(key);
    return undefined;
  }, [key]);

  function onUnlock(event) {
    event.preventDefault();
    const next = keyInput.trim();
    if (!next) {
      setError("reviewNeedKey");
      return;
    }
    setKey(next);
  }

  async function onAction(id, action) {
    if (!key) return;
    setBusyId(id);
    setError("");
    try {
      const payload = await reviewWish({ key, id, action });
      setPending(payload.pending);
      setPublicCount(payload.publicCount);
      setNotice(payload.notice || (action === "approve" ? t.reviewApproved : t.reviewRemoved));
    } catch {
      setError("reviewFailed");
    } finally {
      setBusyId("");
    }
  }

  return (
    <Frame>
      <section className="section">
        <div className="wrap narrow">
          <header className="section-h">
            <h1>{t.reviewTitle}</h1>
            <p>{t.reviewKicker}</p>
          </header>
          <p className="reading">{t.reviewLead}</p>

          {!key ? (
            <form className="form" onSubmit={onUnlock}>
              <label className="field">
                <span>{t.reviewKey}</span>
                <input
                  value={keyInput}
                  onChange={(event) => {
                    setKeyInput(event.target.value);
                    setError("");
                  }}
                  autoComplete="off"
                  placeholder={t.reviewKeyPlaceholder}
                />
              </label>
              {error ? (
                <p className="form-error" role="alert">
                  {t[error]}
                </p>
              ) : null}
              <button className="btn" type="submit">
                {t.reviewOpen}
              </button>
            </form>
          ) : (
            <>
              <p className="quiet">
                {t.reviewCounts.replace("{pending}", String(pending.length)).replace("{public}", String(publicCount))}
              </p>
              {notice ? (
                <p className="preview-note" role="status">
                  {notice}
                </p>
              ) : null}
              {error ? (
                <p className="form-error" role="alert">
                  {t[error]}
                </p>
              ) : null}
              {loading ? <p className="quiet">{t.reviewLoading}</p> : null}
              {!loading && pending.length === 0 ? <p className="quiet">{t.reviewEmpty}</p> : null}
              {pending.length > 0 ? (
                <ol className="wishes">
                  {pending.map((wish) => (
                    <li key={wish.id} className="wish">
                      <h3>{wish.name}</h3>
                      {wish.message ? <p>{wish.message}</p> : <p className="quiet">{t.reviewVoiceOnly}</p>}
                      {wish.audioUrl ? <WishAudio audioUrl={wish.audioUrl} /> : null}
                      <time dateTime={wish.submittedAt}>{formatWhen(wish.submittedAt, lang)}</time>
                      <div className="voice-actions" style={{ marginTop: "0.7rem" }}>
                        <button className="btn" type="button" disabled={Boolean(busyId)} onClick={() => onAction(wish.id, "approve")}>
                          {busyId === wish.id ? t.reviewWorking : t.reviewApprove}
                        </button>
                        <button className="btn" type="button" disabled={Boolean(busyId)} onClick={() => onAction(wish.id, "reject")}>
                          {t.reviewReject}
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
              <p className="center" style={{ marginTop: "1.5rem" }}>
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    setKey("");
                    setKeyInput("");
                    setPending([]);
                    setNotice("");
                    try {
                      sessionStorage.removeItem(KEY_STORAGE);
                    } catch {
                      /* ignore */
                    }
                  }}
                >
                  {t.reviewLock}
                </button>
              </p>
            </>
          )}
        </div>
      </section>
    </Frame>
  );
}
