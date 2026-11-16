import { useState } from "react";
import { wedding } from "../content.js";

function Method({ method }) {
  const [copied, setCopied] = useState(false);

  if (method.href) {
    return (
      <a className="gift-card" href={method.href} target="_blank" rel="noreferrer">
        <span>{method.name}</span>
        {method.detail ? <small>{method.detail}</small> : null}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="gift-card"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(method.detail || method.name);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      <span>{method.name}</span>
      <small>{copied ? "Copied" : method.detail}</small>
    </button>
  );
}

export function Gift() {
  const methods = wedding.gifts ?? [];

  return (
    <section className="section" id="gift">
      <div className="wrap narrow">
        <header className="section-h reveal">
          <h1>Our future life</h1>
          <p>A gift, if you wish</p>
        </header>
        <p className="reading reveal">{wedding.giftNote}</p>
        {methods.length > 0 ? (
          <div className="gift-methods reveal">
            {methods.map((method) => (
              <Method key={method.name} method={method} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
