
const STORE_NAME = "etf-sos-history";
const HISTORY_KEY = "scan-history";
const MAX_ENTRIES = 100;

export async function saveScan(result) {
  try {
    const { getStore } = await import("@netlify/blobs");

    const store = getStore(STORE_NAME);
    const previous = await store.get(HISTORY_KEY, { type: "json" });
    const history = Array.isArray(previous) ? previous : [];

    const entry = {
      checkedAt: result.checkedAt,
      ok: result.ok,
      sources: result.sources,
      itemCount: result.items.length,
      items: result.items
    };

    history.unshift(entry);

    await store.setJSON(
      HISTORY_KEY,
      history.slice(0, MAX_ENTRIES)
    );

    return {
      available: true,
      entries: Math.min(history.length, MAX_ENTRIES)
    };
  } catch (error) {
    console.error("ETF SOS history save failed:", error.message);

    return {
      available: false,
      entries: 0,
      error: "Storico non disponibile: verifica la configurazione Netlify."
    };
  }
}

export async function getHistory() {
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore(STORE_NAME);
    const history = await store.get(HISTORY_KEY, { type: "json" });

    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error("ETF SOS history read failed:", error.message);
    return [];
  }
}
