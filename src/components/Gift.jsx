import { wedding } from "../content.js";
import { useI18n } from "../i18n.jsx";
import { publicUrl } from "../publicUrl.js";

export function Gift() {
  const { lang, t } = useI18n();
  const zh = lang === "zh";
  const paragraphs = (zh ? wedding.giftParagraphsZh : wedding.giftParagraphs) ?? [];
  const codes = wedding.payCodes ?? [];

  return (
    <section className="section" id="gifts">
      <div className="wrap narrow">
        <header className="section-h">
          <h1>{t.giftsTitle}</h1>
          <p>{t.giftsKicker}</p>
        </header>
        {paragraphs.map((paragraph) => (
          <p className="reading" key={paragraph}>
            {paragraph}
          </p>
        ))}
        {codes.length > 0 ? (
          <>
            <p className="reading">{zh ? wedding.payNoteZh : wedding.payNote}</p>
            <div className="pay-codes">
              {codes.map((code) => (
                <figure key={code.src}>
                  <img src={publicUrl(code.src)} alt={zh ? code.altZh : code.alt} />
                  <figcaption>{code.label}</figcaption>
                </figure>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
