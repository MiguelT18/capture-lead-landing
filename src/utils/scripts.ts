import axios from "axios";

export function isEmbeddedBrowser() {
  const ua = navigator.userAgent || "";

  const embeddedIndicators = ["Instagram", "FBAN", "FBAV", "TikTok"];

  return embeddedIndicators.some((indicator) => ua.includes(indicator));
}

export async function getIp() {
  try {
    const res = await axios.get("https://api.ipify.org?format=json");
    const ip = res.data.ip;

    return ip;
  } catch (err) {
    console.error("Error al obtener la IP del usuario:", err);
  }
}