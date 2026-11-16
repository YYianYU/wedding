import { useEffect, useState } from "react";
import { Frame } from "../components/Frame.jsx";
import { compressImage, deletePhoto, listPhotos, savePhoto } from "../photoStore.js";

function useAlbum(version) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const urls = [];

    listPhotos()
      .then((rows) => {
        const ready = rows.map((row) => {
          const url = URL.createObjectURL(row.blob);
          urls.push(url);
          return { id: row.id, name: row.name, createdAt: row.createdAt, url };
        });
        if (cancelled) {
          urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
          return;
        }
        setPhotos(ready);
      })
      .catch(() => {
        if (!cancelled) setPhotos([]);
      });

    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [version]);

  return photos;
}

export function Share() {
  const [version, setVersion] = useState(0);
  const photos = useAlbum(version);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      picked.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [picked]);

  function onPick(event) {
    const files = [...event.target.files].filter((file) => file.type.startsWith("image/")).slice(0, 8);
    setPicked((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url));
      return files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    });
    setError(files.length ? "" : "Please choose a JPG or PNG.");
    event.target.value = "";
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (picked.length === 0) {
      setError("Choose one or more photos first.");
      return;
    }

    setSaving(true);
    setError("");
    const guest = name.trim() || "Guest";

    try {
      for (const item of picked) {
        const blob = await compressImage(item.file);
        await savePhoto({
          id: crypto.randomUUID(),
          name: guest,
          createdAt: new Date().toISOString(),
          blob,
        });
      }
      setPicked((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.url));
        return [];
      });
      setVersion((value) => value + 1);
    } catch {
      setError("That picture couldn't be added. Try a JPG or PNG.");
    } finally {
      setSaving(false);
    }
  }

  async function onRemove(id) {
    await deletePhoto(id);
    setVersion((value) => value + 1);
  }

  return (
    <Frame>
      <section className="section">
        <div className="wrap narrow">
          <header className="section-h">
            <h1>Share photos</h1>
            <p>From the day</p>
          </header>
          <p className="reading">
            Add a picture you took. We would love to see the day through your eyes.
          </p>
          <p className="preview-note">
            Photos stay on this phone or computer until a shared album is connected.
          </p>

          <form className="form" onSubmit={onSubmit}>
            <label className="field">
              <span>Your name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="Optional"
              />
            </label>
            <label className="field">
              <span>Photos</span>
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
                {error}
              </p>
            ) : null}
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add to the album"}
            </button>
          </form>

          {photos.length > 0 ? (
            <ul className="album">
              {photos.map((photo) => (
                <li key={photo.id}>
                  <figure>
                    <img src={photo.url} alt={`Photo shared by ${photo.name}`} />
                    <figcaption>
                      {photo.name}
                      <button className="remove" type="button" onClick={() => onRemove(photo.id)}>
                        Remove
                      </button>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : (
            <p className="quiet album-empty">No photos yet. Yours can be the first.</p>
          )}
        </div>
      </section>
    </Frame>
  );
}
