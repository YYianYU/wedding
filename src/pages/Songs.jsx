import { useEffect, useRef, useState } from "react";
import { Frame } from "../components/Frame.jsx";
import { songs } from "../content.js";
import { useI18n } from "../i18n.jsx";
import { publicUrl } from "../publicUrl.js";

export function Songs() {
  const { lang, t } = useI18n();
  const zh = lang === "zh";
  const audioRef = useRef(null);
  const [activeId, setActiveId] = useState(songs[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const active = songs.find((song) => song.id === activeId) ?? songs[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !active) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [active]);

  const play = async (id) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (id === activeId) {
      if (audio.paused) await audio.play().catch(() => {});
      else audio.pause();
      return;
    }

    setActiveId(id);
    audio.pause();
    audio.src = publicUrl(songs.find((song) => song.id === id)?.src);
    audio.load();
    await audio.play().catch(() => {});
  };

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
                    onClick={() => play(song.id)}
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

          <div className="song-player">
            <p className="song-now">
              {zh ? active.titleZh : active.title}
              <span>{zh ? active.artistZh : active.artist}</span>
            </p>
            <audio
              ref={audioRef}
              className="song-audio"
              controls
              preload="metadata"
              src={publicUrl(active.src)}
            />
          </div>
        </div>
      </section>
    </Frame>
  );
}
