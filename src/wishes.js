import { wedding } from "./content.js";

function endpoint() {
  return wedding.wishesEndpoint || "";
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

export async function sendWish({ name, message }) {
  const url = endpoint();
  if (!url) throw new Error("wishes");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ name, message }),
  });
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "send");
  return Array.isArray(payload.wishes) ? payload.wishes : [];
}
