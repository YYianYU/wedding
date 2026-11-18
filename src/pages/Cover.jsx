import { wedding } from "../content.js";
import { SiteNav } from "../components/SiteNav.jsx";
import { useI18n } from "../i18n.jsx";
import { publicUrl } from "../publicUrl.js";

export function Cover() {
  const { lang, t } = useI18n();
  const zh = lang === "zh";

  return (
    <section className="cover">
      <SiteNav />
      <figure className="cover-photo">
        <img
          src={publicUrl("/story/sustech-walk-cover.jpg?v=3")}
          width={3240}
          height={2160}
          alt={zh ? "仲鑫和易安在南科大手牵手散步" : "Zhongxin and Yian Yu walking hand in hand at SUSTech"}
        />
      </figure>
      <div className="cover-copy">
        <h1>
          <span>{zh ? wedding.partnerAZh : wedding.partnerA}</span>
          <em>{t.connector}</em>
          <span>{zh ? wedding.partnerBZh : wedding.partnerB}</span>
        </h1>
        <p className="cover-place">{zh ? wedding.cityZh : wedding.city}</p>
        <p className="cover-place">{zh ? wedding.dateDisplayZh : wedding.dateDisplay}</p>
        <p className="cover-verse">
          {zh ? wedding.verseZh : wedding.verse}
          <cite>{zh ? wedding.verseRefZh : wedding.verseRef}</cite>
        </p>
      </div>
    </section>
  );
}
