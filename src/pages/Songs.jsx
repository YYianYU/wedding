import { Frame } from "../components/Frame.jsx";
import { useI18n } from "../i18n.jsx";
import { useMusic } from "../music.jsx";

export function Songs() {
  const { lang, t } = useI18n();
  const zh = lang === "zh";
  const { songs, active, playing, playSong } = useMusic();

  if (!active) return null;

  return (
    <Frame>
      <section className="section">
        <div className="wrap narrow">
          <header className="section-h">
            <h1>{t.songsTitle}</h1>
            <p>{t.songsKicker}</p>
          </header>
          <p className="reading">{t.songsLead}</p>

          <ol className="song-list">
            {songs.map((song, index) => {
              const selected = song.id === active.id;
              return (
                <li key={song.id}>
                  <button
                    type="button"
                    className={selected ? "is-active" : undefined}
                    aria-pressed={selected}
                    onClick={() => playSong(song.id)}
                  >
                    <span className="song-num">{String(index + 1).padStart(2, "0")}</span>
                    <span className="song-copy">
                      <strong>{zh ? song.titleZh : song.title}</strong>
                      <span>{zh ? song.artistZh : song.artist}</span>
                    </span>
                    <span className="song-play">{selected && playing ? t.nowPlaying : t.playSong}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <p className="quiet song-hint">{t.songsHint}</p>
        </div>
      </section>
    </Frame>
  );
}
