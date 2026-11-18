import { useState } from "react";
import { Frame } from "../components/Frame.jsx";
import { songs } from "../content.js";
import { useI18n } from "../i18n.jsx";

export function Songs() {
  const { lang, t } = useI18n();
  const zh = lang === "zh";
  const [activeId, setActiveId] = useState(songs[0]?.id ?? "");
  const [started, setStarted] = useState(false);
  const active = songs.find((song) => song.id === activeId) ?? songs[0];

  const play = (id) => {
    setActiveId(id);
    setStarted(true);
  };

  if (!active) return null;

  const embedSrc = started
    ? `https://www.youtube-nocookie.com/embed/${active.youtubeId}?rel=0&autoplay=1`
    : `https://www.youtube-nocookie.com/embed/${active.youtubeId}?rel=0`;

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
                    onClick={() => play(song.id)}
                  >
                    <span className="song-num">{String(index + 1).padStart(2, "0")}</span>
                    <span className="song-copy">
                      <strong>{zh ? song.titleZh : song.title}</strong>
                      <span>{zh ? song.artistZh : song.artist}</span>
                    </span>
                    <span className="song-play">{selected && started ? t.nowPlaying : t.playSong}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="song-player">
            <p className="song-now">
              {zh ? active.titleZh : active.title}
              <span>{zh ? active.artistZh : active.artist}</span>
            </p>
            <div className="song-frame">
              <iframe
                key={`${active.youtubeId}-${started ? "play" : "idle"}`}
                title={zh ? active.titleZh : active.title}
                src={embedSrc}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      </section>
    </Frame>
  );
}
