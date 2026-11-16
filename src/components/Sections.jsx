import { wedding } from "../content.js";

export function Introduction() {
  return (
    <section className="section" id="intro">
      <div className="wrap narrow">
        <header className="section-h reveal">
          <h1>The ceremony</h1>
          <p>An introduction</p>
        </header>
        <p className="reading reveal">{wedding.welcome}</p>
        <dl className="facts reveal">
          <div>
            <dt>When</dt>
            <dd>
              {wedding.weekday}, {wedding.dateDisplay}
              <br />
              {wedding.time}
            </dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>
              {wedding.place}
              <br />
              {wedding.address}
            </dd>
          </div>
        </dl>
        <p className="center reveal">
          <a className="text-link" href={wedding.mapUrl} target="_blank" rel="noreferrer">
            Open the map
          </a>
        </p>
      </div>
    </section>
  );
}

export function Registry() {
  const items = wedding.registry ?? [];

  return (
    <section className="section" id="registry">
      <div className="wrap narrow">
        <header className="section-h reveal">
          <h1>Registry</h1>
          <p>For our home</p>
        </header>
        <p className="reading reveal">{wedding.registryNote}</p>
        {items.length > 0 ? (
          <ul className="link-list reveal">
            {items.map((item) => (
              <li key={item.name}>
                <a href={item.href} target="_blank" rel="noreferrer">
                  <span>{item.name}</span>
                  {item.note ? <small>{item.note}</small> : null}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="quiet reveal">The lists will be linked here.</p>
        )}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <svg className="cross tiny" viewBox="0 0 24 40" aria-hidden="true">
        <path d="M12 1.5v37M3.5 11.5h17" />
      </svg>
      <p className="footer-names">
        {wedding.partnerA}
        <em> &amp; </em>
        {wedding.partnerB}
      </p>
      <p>{wedding.dateDisplay}</p>
      <p className="quiet">{wedding.verseRef}</p>
    </footer>
  );
}
