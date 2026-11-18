import { useEffect, useState } from "react";
import { useI18n } from "../i18n.jsx";
import { listWishes, sendWish, wishesReady } from "../wishes.js";

const STORAGE_KEY = "chen-yu-wishes";

function loadWishes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatWhen(iso, lang) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function Wishes() {
  const { lang, t } = useI18n();
  const shared = wishesReady();
  const [wishes, setWishes] = useState(() => (shared ? [] : loadWishes()));
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!shared) return undefined;
    let cancelled = false;
    listWishes()
      .then((rows) => {
        if (!cancelled) setWishes(rows);
      })
      .catch(() => {
        if (!cancelled) setError("sendFailed");
      });
    return () => {
      cancelled = true;
    };
  }, [shared]);

  async function onSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) {
      setError("needBoth");
      return;
    }

    const wish = {
      id: crypto.randomUUID(),
      name: trimmedName,
      message: trimmedMessage,
      submittedAt: new Date().toISOString(),
    };

    setSending(true);
    setError("");

    try {
      if (shared) {
        setWishes(await sendWish(wish));
      } else {
        const next = [wish, ...wishes].slice(0, 80);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setWishes(next);
      }
      setName("");
      setMessage("");
    } catch {
      setError("sendFailed");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="section tint" id="wishes">
      <div className="wrap narrow">
        <header className="section-h reveal">
          <h1>{t.messagesTitle}</h1>
          <p>{t.messagesKicker}</p>
        </header>
        <p className="lead reveal">{t.messagesLead}</p>
        <p className="preview-note reveal">{shared ? t.messagesShared : t.messagesPreview}</p>

        <form className="form" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span>{t.name}</span>
            <input
              name="wish-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              autoComplete="name"
              placeholder={t.namePlaceholder}
              aria-invalid={error && !name.trim() ? "true" : "false"}
            />
          </label>
          <label className="field">
            <span>{t.message}</span>
            <textarea
              name="wish-message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setError("");
              }}
              maxLength={500}
              rows={4}
              placeholder={t.messagePlaceholder}
              aria-invalid={error && !message.trim() ? "true" : "false"}
            />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {t[error]}
            </p>
          ) : null}
          <button className="btn solid" type="submit" disabled={sending}>
            {sending ? t.sending : t.leaveMessage}
          </button>
        </form>

        {wishes.length > 0 ? (
          <ol className="wishes">
            {wishes.map((wish) => (
              <li key={wish.id} className="wish">
                <h3>{wish.name}</h3>
                <p>{wish.message}</p>
                <time dateTime={wish.submittedAt}>{formatWhen(wish.submittedAt, lang)}</time>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
