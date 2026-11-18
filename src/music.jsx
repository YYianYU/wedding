import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { songs } from "./content.js";
import { publicUrl } from "./publicUrl.js";

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const load = useCallback((nextIndex, shouldPlay) => {
    const audio = audioRef.current;
    const song = songs[nextIndex];
    if (!audio || !song) return;

    indexRef.current = nextIndex;
    setIndex(nextIndex);
    audio.src = publicUrl(song.src);
    audio.load();
    if (shouldPlay) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || songs.length === 0) return;

    audio.src = publicUrl(songs[0].src);
    audio.load();
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));

    const onEnded = () => {
      const next = (indexRef.current + 1) % songs.length;
      load(next, true);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [load]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, []);

  const playSong = useCallback(
    (id) => {
      const next = songs.findIndex((song) => song.id === id);
      if (next < 0) return;
      const audio = audioRef.current;
      if (!audio) return;

      if (next === indexRef.current && !audio.paused) {
        audio.pause();
        setPlaying(false);
        return;
      }

      if (next === indexRef.current) {
        audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        return;
      }

      load(next, true);
    },
    [load],
  );

  const value = useMemo(
    () => ({
      songs,
      index,
      active: songs[index] ?? null,
      playing,
      toggle,
      playSong,
    }),
    [index, playing, toggle, playSong],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" className="site-audio" />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
