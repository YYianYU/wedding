import { wedding } from "./content.js";

function endpoint() {
  return wedding.albumEndpoint || "";
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

export function albumReady() {
  return Boolean(endpoint());
}

export async function listAlbum() {
  const url = endpoint();
  if (!url) return [];
  const response = await fetch(url);
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "list");
  return Array.isArray(payload.photos) ? payload.photos : [];
}

export async function uploadAlbumPhoto({ name, blob }) {
  const url = endpoint();
  if (!url) throw new Error("album");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      name,
      mimeType: blob.type || "image/jpeg",
      data: await blobToBase64(blob),
    }),
  });
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "upload");
  return payload;
}
