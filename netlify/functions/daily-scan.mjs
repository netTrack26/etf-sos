
import { scanSources } from '../../lib/scan-core.mjs';
import { saveScan } from '../../lib/history-store.mjs';

export default async () => {
  const result = await scanSources([]);
  const saved = await saveScan(result);

  console.log(JSON.stringify({
    event: 'etf-sos-daily-scan',
    checkedAt: result.checkedAt,
    sourcesOk: result.sources.filter(s => s.ok).length,
    sourcesTotal: result.sources.length,
    detectedTitles: result.items.length,
    historySaved: saved.available
  }));

  return new Response(JSON.stringify({
    ok: result.ok,
    checkedAt: result.checkedAt,
    sourceSummary: result.sources.map(s => ({
      id: s.id,
      ok: s.ok,
      count: s.count
    })),
    persistence: saved
  }), {
    status: result.ok ? 200 : 502,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
};
