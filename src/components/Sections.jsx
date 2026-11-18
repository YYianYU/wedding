import { wedding } from "../content.js";
import { useI18n } from "../i18n.jsx";

export function Introduction() {
  const { lang, t } = useI18n();
  const zh = lang === "zh";

  return (
    <section className="section" id="intro">
      <div className="wrap narrow">
        <header className="section-h reveal">
          <h1>{t.ceremonyTitle}</h1>
          <p>{t.ceremonyKicker}</p>
        </header>
        <p className="reading reveal">{zh ? wedding.welcomeZh : wedding.welcome}</p>
        <dl className="facts reveal">
          <div>
            <dt>{t.when}</dt>
            <dd>
              {zh ? wedding.weekdayZh : wedding.weekday}
              {zh ? "，" : ", "}
              {zh ? wedding.dateDisplayZh : wedding.dateDisplay}
              <br />
              {zh ? wedding.timeZh : wedding.time}
            </dd>
          </div>
          <div>
            <dt>{t.where}</dt>
            <dd>
              {zh ? wedding.placeZh : wedding.place}
              <br />
              {wedding.address}
            </dd>
          </div>
          <div>
            <dt>{t.contact}</dt>
            <dd>
              {wedding.emails.map((person) => (
                <span className="contact-line" key={person.address}>
                  {zh ? person.nameZh : person.name}
                  {" · "}
                  <a href={`mailto:${person.address}`}>{person.address}</a>
                </span>
              ))}
            </dd>
          </div>
        </dl>
        <p className="center reveal">
          <a className="text-link" href={wedding.mapUrl} target="_blank" rel="noreferrer">
            {t.openMap}
          </a>
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  const { lang } = useI18n();
  const zh = lang === "zh";

  return (
    <footer className="footer">
      <svg className="cross tiny" viewBox="0 0 24 40" aria-hidden="true">
        <path d="M12 1.5v37M3.5 11.5h17" />
      </svg>
      <p className="footer-names">
        {zh ? wedding.partnerAZh : wedding.partnerA}
        <em>{zh ? " 与 " : " & "}</em>
        {zh ? wedding.partnerBZh : wedding.partnerB}
      </p>
      <p>{zh ? wedding.dateDisplayZh : wedding.dateDisplay}</p>
      <p className="quiet">{zh ? wedding.verseRefZh : wedding.verseRef}</p>
    </footer>
  );
}
