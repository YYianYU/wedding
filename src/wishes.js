import { wedding } from "./content.js";

function endpoint() {
  return wedding.wishesEndpoint || "";
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function wishesReady() {
  return Boolean(endpoint());
}

export async function listWishes() {
  const url = endpoint();
  if (!url) return [];
  const response = await fetch(url);
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "list");
  return Array.isArray(payload.wishes) ? payload.wishes : [];
}

export async function sendWish({ name, message, audioBlob }) {
  const url = endpoint();
  if (!url) throw new Error("wishes");
  const body = {
    name,
    message: message || "",
  };
  if (audioBlob) {
    body.mimeType = audioBlob.type || "audio/webm";
    body.audio = await blobToBase64(audioBlob);
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "send");
  return {
    wishes: Array.isArray(payload.wishes) ? payload.wishes : [],
    pending: Boolean(payload.pending),
  };
}

export async function loadWishAudio(audioUrl) {
  const response = await fetch(audioUrl);
  const payload = await response.json();
  if (!payload.ok || !payload.data) throw new Error(payload.error || "audio");
  const binary = atob(payload.data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: payload.mimeType || "audio/webm" }));
}

function reviewUrl(key, extra = {}) {
  const url = new URL(endpoint());
  url.searchParams.set("key", key);
  url.searchParams.set("format", "json");
  Object.entries(extra).forEach(([name, value]) => {
    if (value) url.searchParams.set(name, value);
  });
  return url.toString();
}

export async function listPendingWishes(key) {
  const response = await fetch(reviewUrl(key));
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "review");
  return {
    pending: Array.isArray(payload.pending) ? payload.pending : [],
    publicCount: Number(payload.publicCount) || 0,
    notice: payload.notice || "",
  };
}

export async function reviewWish({ key, id, action }) {
  const extra = action === "reject" ? { reject: id } : { approve: id };
  const response = await fetch(reviewUrl(key, extra));
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "review");
  return {
    pending: Array.isArray(payload.pending) ? payload.pending : [],
    publicCount: Number(payload.publicCount) || 0,
    notice: payload.notice || "",
  };
}
