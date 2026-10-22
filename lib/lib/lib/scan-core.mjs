
export const SOURCES = [
  {
    id: "vanguard",
    name: "Vanguard",
    url: "https://global.vanguard.com/it-it/investment-products/fund-documents"
  },
  {
    id: "spdr",
    name: "State Street SPDR",
    url: "https://www.ssga.com/uk/en_gb/intermediary/resources/documents/announcements"
  },
  {
    id: "amundi",
    name: "Amundi ETF",
    url: "https://www.amundi.ie/retail/amundi-etf-icav"
  },
  {
    id: "borsa",
    name: "Borsa Italiana ETFplus",
    url: "https://www.borsaitaliana.it/borsa/avvisi-negoziazione/etfplus/etf.html?lang=it"
  }
];

export async function scanSources(isins = []) {
  const checkedAt = new Date().toISOString();

  const sources = await Promise.all(SOURCES.map(async source => {
    try {
      const response = await fetch(source.url, {
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const items = [];
      const links = html.matchAll(
        /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
      );

      for (const match of links) {
        const title = match[2].replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ").trim();

        if (!title || title.length < 8) continue;
        if (!/notice|announcement|avviso|delisting|merger|fusion|index|indice|dividend|distribution|prospectus|document|negoziazione|listing|fee|cost|ocf|ter|shareholder|azionisti/i.test(title)) continue;

        let url;
        try {
          url = new URL(match[1], source.url).href;
        } catch {
          continue;
        }

        if (!url.startsWith("https://")) continue;

        const matchedIsins = isins.filter(isin =>
          title.toUpperCase().includes(isin.toUpperCase())
        );

        items.push({
          id: `${source.id}-${items.length}-${title.slice(0, 30)}`,
          sourceId: source.id,
          source: source.name,
          sourceUrl: source.url,
          title: title.slice(0, 250),
          date: "Verificare la data nella fonte",
          category: "Comunicazione da verificare",
          kind: matchedIsins.length ? "possible-match" : "official-source",
          status: matchedIsins.length ? "POSSIBILE CORRISPONDENZA" : "DA VERIFICARE",
          summary: "Titolo estratto automaticamente. La rilevanza per il tuo ETF non è confermata.",
          match: matchedIsins.join(", "),
          url,
          matchedIsins,
          relevance: matchedIsins.length ? "possibile" : "non-confermata"
        });

        if (items.length >= 20) break;
      }

      return {
        id: source.id,
        name: source.name,
        url: source.url,
        ok: true,
        checkedAt,
        count: items.length,
        items,
        note: items.length
          ? "Titoli estratti dalla pagina; verifica i documenti originali."
          : "Pagina raggiunta, nessun titolo compatibile trovato."
      };
    } catch (error) {
      return {
        id: source.id,
        name: source.name,
        url: source.url,
        ok: false,
        checkedAt,
        count: 0,
        items: [],
        note: String(error.message || error)
      };
    }
  }));

  return {
    ok: sources.some(source => source.ok),
    checkedAt,
    requestedIsins: isins,
    sources: sources.map(({ items, ...source }) => source),
    items: sources.flatMap(source => source.items).slice(0, 60),
    limitations: [
      "Copertura parziale delle comunicazioni pubbliche.",
      "I titoli non confermano che un ETF sia coinvolto.",
      "Verificare sempre la fonte ufficiale."
    ]
  };
}
