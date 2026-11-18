import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n.jsx";
import { listWishes, sendWish, wishesReady } from "../wishes.js";
import { WishAudio } from "./WishAudio.jsx";

const STORAGE_KEY = "chen-yu-wishes";
const MAX_MS = 45000;
const MAX_BYTES = 2 * 1024 * 1024;

function loadWishes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatWhen(iso, lang) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { month: "long", day: "numeric", year: "numeric" });
}

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  return "";
}

function formatSeconds(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(total / 60)).padStart(1, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function Wishes() {
  const { lang, t } = useI18n();
  const shared = wishesReady();
  const [wishes, setWishes] = useState(() => (shared ? [] : loadWishes()));
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreview, setAudioPreview] = useState("");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(0);
  const startedAtRef = useRef(0);
  const canRecord = typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

  useEffect(() => {
    if (!shared) return undefined;
    let cancelled = false;
    listWishes()
      .then((rows) => {
        if (!cancelled) setWishes(rows);
      })
      .catch(() => {
        if (!cancelled) setError("sendFailed");
      });
    return () => {
      cancelled = true;
    };
  }, [shared]);

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stream?.getTracks().forEach((track) => track.stop());
        recorderRef.current.stop();
      }
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [audioPreview]);

  function clearAudio() {
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioBlob(null);
    setAudioPreview("");
    setRecordMs(0);
  }

  async function startRecording() {
    setError("");
    if (!canRecord) {
      setError("audioUnsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setRecordMs(0);
      setRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        window.clearInterval(timerRef.current);
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        recorderRef.current = null;
        setRecording(false);
        if (!blob.size || blob.size > MAX_BYTES) {
          setError("audioFailed");
          return;
        }
        if (audioPreview) URL.revokeObjectURL(audioPreview);
        setAudioBlob(blob);
        setAudioPreview(URL.createObjectURL(blob));
      };

      recorder.start(250);
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setRecordMs(elapsed);
        if (elapsed >= MAX_MS && recorder.state === "recording") recorder.stop();
      }, 200);
    } catch {
      setRecording(false);
      setError("micDenied");
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }

  async function onSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || (!trimmedMessage && !audioBlob)) {
      setError("needBoth");
      return;
    }

    setSending(true);
    setError("");

    try {
      if (shared) {
        setWishes(await sendWish({ name: trimmedName, message: trimmedMessage, audioBlob }));
      } else {
        const wish = {
          id: crypto.randomUUID(),
          name: trimmedName,
          message: trimmedMessage,
          submittedAt: new Date().toISOString(),
          audioPreview: audioBlob ? await blobToDataUrl(audioBlob) : "",
        };
        const next = [wish, ...wishes].slice(0, 80);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setWishes(next);
      }
      setName("");
      setMessage("");
      clearAudio();
    } catch {
      setError("sendFailed");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="section tint" id="wishes">
      <div className="wrap narrow">
        <header className="section-h reveal">
          <h1>{t.messagesTitle}</h1>
          <p>{t.messagesKicker}</p>
        </header>
        <p className="lead reveal">{t.messagesLead}</p>
        <p className="preview-note reveal">{shared ? t.messagesShared : t.messagesPreview}</p>

        <form className="form" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span>{t.name}</span>
            <input
              name="wish-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              autoComplete="name"
              placeholder={t.namePlaceholder}
              aria-invalid={error && !name.trim() ? "true" : "false"}
            />
          </label>
          <label className="field">
            <span>{t.message}</span>
            <textarea
              name="wish-message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setError("");
              }}
              maxLength={500}
              rows={4}
              placeholder={t.messagePlaceholder}
            />
          </label>

          <div className="field voice-field">
            <span>{t.voiceNote}</span>
            <p className="quiet voice-hint">{t.voiceHint}</p>
            <div className="voice-actions">
              {recording ? (
                <button className="btn" type="button" onClick={stopRecording}>
                  {t.stopRecording} · {formatSeconds(recordMs)}
                </button>
              ) : (
                <button className="btn" type="button" onClick={startRecording} disabled={sending || !canRecord}>
                  {audioBlob ? t.reRecord : t.startRecording}
                </button>
              )}
              {audioBlob && !recording ? (
                <button className="btn" type="button" onClick={clearAudio}>
                  {t.clearRecording}
                </button>
              ) : null}
            </div>
            {recording ? <p className="quiet">{t.recordingNow}</p> : null}
            {audioPreview ? <audio className="wish-audio" controls src={audioPreview} /> : null}
          </div>

          {error ? (
            <p className="form-error" role="alert">
              {t[error]}
            </p>
          ) : null}
          <button className="btn solid" type="submit" disabled={sending || recording}>
            {sending ? t.sending : t.leaveMessage}
          </button>
        </form>

        {wishes.length > 0 ? (
          <ol className="wishes">
            {wishes.map((wish) => (
              <li key={wish.id} className="wish">
                <h3>{wish.name}</h3>
                {wish.message ? <p>{wish.message}</p> : null}
                {wish.audioUrl ? <WishAudio audioUrl={wish.audioUrl} /> : null}
                {!wish.audioUrl && wish.audioPreview ? <audio className="wish-audio" controls src={wish.audioPreview} /> : null}
                <time dateTime={wish.submittedAt}>{formatWhen(wish.submittedAt, lang)}</time>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
