import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { songs } from "./content.js";
import { publicUrl } from "./publicUrl.js";

const MusicContext = createContext(null);
const BACKGROUND_VOLUME = 0.28;

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const indexRef = useRef(0);
  const stoppedByUserRef = useRef(false);
  const unlockBoundRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  const tryPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || stoppedByUserRef.current) return Promise.resolve(false);
    audio.volume = BACKGROUND_VOLUME;
    return audio
      .play()
      .then(() => {
        setPlaying(true);
        return true;
      })
      .catch(() => {
        setPlaying(false);
        return false;
      });
  }, []);

  const load = useCallback(
    (nextIndex, shouldPlay) => {
      const audio = audioRef.current;
      const song = songs[nextIndex];
      if (!audio || !song) return;

      indexRef.current = nextIndex;
      audio.volume = BACKGROUND_VOLUME;
      audio.src = publicUrl(song.src);
      audio.load();
      if (shouldPlay) tryPlay();
    },
    [tryPlay],
  );

  const bindUnlock = useCallback(() => {
    if (unlockBoundRef.current) return;
    unlockBoundRef.current = true;

    const unlock = () => {
      if (stoppedByUserRef.current) return;
      tryPlay().then((started) => {
        if (!started) return;
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
        unlockBoundRef.current = false;
      });
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
  }, [tryPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || songs.length === 0) return;

    audio.volume = BACKGROUND_VOLUME;
    audio.src = publicUrl(songs[0].src);
    audio.load();

    tryPlay().then((started) => {
      if (!started) bindUnlock();
    });

    const onEnded = () => {
      if (stoppedByUserRef.current) return;
      const next = (indexRef.current + 1) % songs.length;
      load(next, true);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onPageHide = () => {
      audio.pause();
      setPlaying(false);
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      window.removeEventListener("pagehide", onPageHide);
      audio.pause();
    };
  }, [bindUnlock, load, tryPlay]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = BACKGROUND_VOLUME;

    if (audio.paused) {
      stoppedByUserRef.current = false;
      tryPlay();
    } else {
      stoppedByUserRef.current = true;
      audio.pause();
      setPlaying(false);
    }
  }, [tryPlay]);

  const value = useMemo(() => ({ playing, toggle }), [playing, toggle]);

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" playsInline className="site-audio" />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
