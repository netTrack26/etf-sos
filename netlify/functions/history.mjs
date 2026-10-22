
import { getHistory } from "../../lib/history-store.mjs";

export default async () => {
  const history = await getHistory();

  return new Response(
    JSON.stringify({
      ok: true,
      count: history.length,
      history
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    }
  );
};
