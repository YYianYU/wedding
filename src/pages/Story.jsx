import { Frame } from "../components/Frame.jsx";
import { JourneyMap } from "../components/JourneyMap.jsx";
import { story, wedding } from "../content.js";
import { useI18n } from "../i18n.jsx";
import { publicUrl } from "../publicUrl.js";

export function Story() {
  const { lang, t } = useI18n();
  const zh = lang === "zh";

  return (
    <Frame>
      <section className="section">
        <div className="wrap story">
          <header className="section-h">
            <h1>{t.storyTitle}</h1>
            <p>{t.storyKicker}</p>
          </header>
          <p className="reading">{t.storyLead}</p>
          <JourneyMap />
          {story.map((chapter) => (
            <article className="chapter" key={`${chapter.when}-${chapter.place}`}>
              <header>
                <p>{zh ? chapter.whenZh : chapter.when}</p>
                <h2>
                  {zh ? chapter.whereZh : chapter.where}
                  {zh ? null : <span>{chapter.place}</span>}
                </h2>
              </header>
              <p>{zh ? chapter.textZh : chapter.text}</p>
              {chapter.photos.some((photo) => !photo.band) ? (
                <div className={`chapter-photos count-${chapter.photos.filter((photo) => !photo.band).length}${chapter.photos.some((photo) => photo.wide) ? " has-wide" : ""}`}>
                  {chapter.photos.filter((photo) => !photo.band).map((photo) => (
                    <figure key={photo.src} className={photo.wide ? "wide" : undefined}>
                      <img className={photo.fit === "full" ? "full" : undefined} src={publicUrl(photo.src)} alt={zh ? photo.altZh : photo.alt} />
                    </figure>
                  ))}
                </div>
              ) : null}
              {chapter.photos.some((photo) => photo.band) ? (
                <div className={`chapter-photos band count-${chapter.photos.filter((photo) => photo.band).length}`}>
                  {chapter.photos.filter((photo) => photo.band).map((photo) => (
                    <figure key={photo.src}>
                      <img className={photo.fit === "full" ? "full" : undefined} src={publicUrl(photo.src)} alt={zh ? photo.altZh : photo.alt} />
                    </figure>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
          <article className="chapter chapter-next">
            <header>
              <p>{zh ? wedding.dateDisplayZh : wedding.dateDisplay}</p>
              <h2>
                {zh ? wedding.cityZh : wedding.city}
                <span>{t.weddingKicker}</span>
              </h2>
            </header>
            <p>
              {zh ? wedding.weekdayZh : wedding.weekday}
              {zh ? "" : ", "}
              {zh ? wedding.timeZh : wedding.time}
              {zh ? "，" : ", "}
              {zh ? `在${wedding.placeZh}` : `at ${wedding.place}`}
              {zh ? "。" : ". "}
              {t.weddingClose}
            </p>
          </article>
        </div>
      </section>
    </Frame>
  );
}
