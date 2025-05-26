import axios from "axios";

export function isEmbeddedBrowser(): boolean {
  const ua = navigator.userAgent || "";
  const embeddedIndicators = ["FBAN", "FBAV", "Instagram", "TikTok", "Twitter", "Line", "Snapchat"];

  // Detección por user agent
  const isByUserAgent = embeddedIndicators.some(indicator => ua.includes(indicator));

  // Detección por comportamiento anormal de navegación
  const isFramed = window.self !== window.top;

  // Detección específica de TikTok
  const isTikTokWebView = /\bcom\.zhiliaoapp\.musically\b/i.test(ua);

  return isByUserAgent || isFramed || isTikTokWebView;
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