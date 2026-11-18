import { useEffect, useState } from "react";
import { albumReady, listAlbum, uploadAlbumPhoto } from "../album.js";
import { Frame } from "../components/Frame.jsx";
import { wedding } from "../content.js";
import { useI18n } from "../i18n.jsx";
import { compressImage } from "../photoStore.js";

export function Share() {
  const { t } = useI18n();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(albumReady());
  const [name, setName] = useState("");
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      picked.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [picked]);

  useEffect(() => {
    if (!albumReady()) return undefined;
    let cancelled = false;
    listAlbum()
      .then((rows) => {
        if (!cancelled) setPhotos(rows);
      })
      .catch(() => {
        if (!cancelled) setError("albumClosed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [saved]);

  function onPick(event) {
    const files = [...event.target.files].filter((file) => file.type.startsWith("image/")).slice(0, 8);
    setPicked((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url));
      return files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    });
    setSaved(false);
    setError(files.length ? "" : "chooseImage");
    event.target.value = "";
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!albumReady()) {
      setError("albumOffline");
      return;
    }
    if (picked.length === 0) {
      setError("chooseFirst");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);
    const guest = name.trim() || t.guest;

    try {
      for (const item of picked) {
        const blob = await compressImage(item.file);
        await uploadAlbumPhoto({ name: guest, blob });
      }
      setPicked((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.url));
        return [];
      });
      setSaved(true);
    } catch {
      setError("saveFailed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Frame>
      <section className="section">
        <div className="wrap narrow">
          <header className="section-h">
            <h1>{t.photosTitle}</h1>
            <p>{t.photosKicker}</p>
          </header>
          <p className="reading">{t.photosLead}</p>
          {albumReady() ? (
            <p className="preview-note">
              <a className="text-link" href={wedding.albumUrl} target="_blank" rel="noreferrer">
                {t.openAlbum}
              </a>
            </p>
          ) : null}

          {albumReady() ? (
          <form className="form" onSubmit={onSubmit}>
            <label className="field">
              <span>{t.yourName}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder={t.optional}
              />
            </label>
            <label className="field">
              <span>{t.photos}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={onPick} />
            </label>
            {picked.length > 0 ? (
              <ul className="picked">
                {picked.map((item) => (
                  <li key={item.url}>
                    <img src={item.url} alt="" />
                  </li>
                ))}
              </ul>
            ) : null}
            {error ? (
              <p className="form-error" role="alert">
                {t[error]}
              </p>
            ) : null}
            {saved ? <p className="preview-note">{t.saved}</p> : null}
            <button className="btn" type="submit" disabled={saving}>
              {saving ? t.saving : t.addAlbum}
            </button>
          </form>
          ) : (
            <p>
              <a className="btn" href={wedding.albumUrl} target="_blank" rel="noreferrer">
                {t.addAlbum}
              </a>
            </p>
          )}

          {loading ? <p className="quiet album-empty">{t.opening}</p> : null}
          {!loading && photos.length > 0 ? (
            <ul className="album">
              {photos.map((photo) => (
                <li key={photo.id}>
                  <figure>
                    <img src={photo.url} alt={photo.name ? `${t.photoBy} ${photo.name}` : t.albumPhoto} />
                    {photo.name ? <figcaption>{photo.name}</figcaption> : null}
                  </figure>
                </li>
              ))}
            </ul>
          ) : null}
          {!loading && albumReady() && photos.length === 0 ? (
            <p className="quiet album-empty">{t.emptyAlbum}</p>
          ) : null}
        </div>
      </section>
    </Frame>
  );
}
