export function getUTMParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    source: params.get("utm_source") || null,
    medium: params.get('utm_medium') || null,
    campaign: params.get('utm_campaign') || null,
    term: params.get('utm_term') || null,
    content: params.get('utm_content') || null,
  }
}

export function saveUTMToLocalStorage() {
  const utm = getUTMParams()
  localStorage.setItem("utm_params", JSON.stringify(utm))
}

export function getSavedUTMFromLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem("utm_params") || "{}")
  } catch {
    return {}
  }
}