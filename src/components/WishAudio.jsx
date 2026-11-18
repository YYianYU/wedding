import { useEffect, useState } from "react";
import { loadWishAudio } from "../wishes.js";
import { useI18n } from "../i18n.jsx";

export function WishAudio({ audioUrl }) {
  const { t } = useI18n();
  const [src, setSrc] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let revoked = "";
    let cancelled = false;
    setLoading(true);
    setError(false);
    loadWishAudio(audioUrl)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        revoked = url;
        setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [audioUrl]);

  if (loading) return <p className="quiet wish-audio-status">{t.audioLoading}</p>;
  if (error || !src) return <p className="quiet wish-audio-status">{t.audioFailed}</p>;
  return <audio className="wish-audio" controls preload="metadata" src={src} />;
}
