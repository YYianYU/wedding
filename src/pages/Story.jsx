import { Frame } from "../components/Frame.jsx";
import { JourneyMap } from "../components/JourneyMap.jsx";
import { story, wedding } from "../content.js";
import { publicUrl } from "../publicUrl.js";

export function Story() {
  return (
    <Frame>
      <section className="section">
        <div className="wrap story">
          <header className="section-h">
            <h1>Our story</h1>
            <p>In time and place</p>
          </header>
          <p className="reading">
            We met at SUSTech. The map follows us from Shenzhen to Jiangxi and Sichuan, and then across to Texas and Ann Arbor.
          </p>
          <JourneyMap />
          {story.map((chapter) => (
            <article className="chapter" key={`${chapter.when}-${chapter.place}`}>
              <header>
                <p>{chapter.when}</p>
                <h2>
                  {chapter.where}
                  <span>{chapter.place}</span>
                </h2>
              </header>
              <p>{chapter.text}</p>
              {chapter.photos.length > 0 ? (
                <div className={`chapter-photos count-${chapter.photos.length}${chapter.photos.some((photo) => photo.wide) ? " has-wide" : ""}`}>
                  {chapter.photos.map((photo) => (
                    <figure key={photo.src} className={photo.wide ? "wide" : undefined}>
                      <img className={photo.fit === "full" ? "full" : undefined} src={publicUrl(photo.src)} alt={photo.alt} />
                    </figure>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
          <article className="chapter chapter-next">
            <header>
              <p>{wedding.dateDisplay}</p>
              <h2>
                {wedding.city}
                <span>The wedding</span>
              </h2>
            </header>
            <p>
              {wedding.weekday}, {wedding.time}, at {wedding.place}. Now our new life is beginning.
            </p>
          </article>
        </div>
      </section>
    </Frame>
  );
}
