
import { scanSources } from "../../lib/scan-core.mjs";

export default async (request) => {
  let isins = [];

  try {
    const url = new URL(request.url);
    isins = (url.searchParams.get("isins") || "")
      .split(",")
      .map(value => value.trim().toUpperCase())
      .filter(value => /^[A-Z]{2}[A-Z0-9]{10}$/.test(value))
      .slice(0, 30);
  } catch {}

  const result = await scanSources(isins);

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 502,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
};
