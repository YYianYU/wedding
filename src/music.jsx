import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { songs } from "./content.js";
import { publicUrl } from "./publicUrl.js";

const MusicContext = createContext(null);
const BACKGROUND_VOLUME = 0.28;

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const indexRef = useRef(0);
  const [playing, setPlaying] = useState(false);

  const load = useCallback((nextIndex, shouldPlay) => {
    const audio = audioRef.current;
    const song = songs[nextIndex];
    if (!audio || !song) return;

    indexRef.current = nextIndex;
    audio.volume = BACKGROUND_VOLUME;
    audio.src = publicUrl(song.src);
    audio.load();
    if (shouldPlay) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || songs.length === 0) return;

    audio.volume = BACKGROUND_VOLUME;
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
    audio.volume = BACKGROUND_VOLUME;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, []);

  const value = useMemo(() => ({ playing, toggle }), [playing, toggle]);

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" className="site-audio" />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
