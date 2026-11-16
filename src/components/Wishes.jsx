import { useState } from "react";
import { wedding } from "../content.js";

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

function formatWhen(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function Wishes() {
  const [wishes, setWishes] = useState(() => loadWishes());
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) {
      setError("Please leave your name and a note.");
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
      if (wedding.wishesEndpoint) {
        const response = await fetch(wedding.wishesEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(wish),
        });
        if (!response.ok) throw new Error("request failed");
      }

      const next = [wish, ...wishes].slice(0, 80);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setWishes(next);
      setName("");
      setMessage("");
    } catch {
      setError("That didn't send. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="section tint" id="wishes">
      <div className="wrap narrow">
        <header className="section-h reveal">
          <h1>Messages</h1>
          <p>A word for us</p>
        </header>
        <p className="lead reveal">Leave a blessing, a memory, or a hello. We will keep every one.</p>
        {!wedding.wishesEndpoint ? (
          <p className="preview-note reveal">Preview: notes stay in this browser until a shared inbox is connected.</p>
        ) : null}

        <form className="form" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span>Name</span>
            <input
              name="wish-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              autoComplete="name"
              placeholder="Your name"
              aria-invalid={error && !name.trim() ? "true" : "false"}
            />
          </label>
          <label className="field">
            <span>Message</span>
            <textarea
              name="wish-message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setError("");
              }}
              maxLength={500}
              rows={4}
              placeholder="A blessing, a memory, a hello"
              aria-invalid={error && !message.trim() ? "true" : "false"}
            />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="btn solid" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Leave a message"}
          </button>
        </form>

        {wishes.length > 0 ? (
          <ol className="wishes">
            {wishes.map((wish) => (
              <li key={wish.id} className="wish">
                <h3>{wish.name}</h3>
                <p>{wish.message}</p>
                <time dateTime={wish.submittedAt}>{formatWhen(wish.submittedAt)}</time>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
