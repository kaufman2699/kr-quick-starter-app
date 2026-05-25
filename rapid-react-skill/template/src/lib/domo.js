/**
 * Helpers for talking to Domo from a Custom App.
 *
 * When deployed inside Domo, the Domo platform injects a global `domo` object
 * (window.domo) that exposes data APIs scoped to the datasets you map in
 * manifest.json. In local dev, that global doesn't exist — these helpers fall
 * back to fetch() against the Domo proxy URL pattern so `npm run dev` works
 * when ryuu-cli is also running.
 *
 * Add datasets to manifest.json under "mapping" before referencing them here:
 *   {
 *     "mapping": [{ "alias": "sales", "dataSetId": "<dataset-uuid>" }]
 *   }
 *
 * Then call domoGet('/data/v1/sales?fields=region,revenue').
 */

const hasDomoRuntime = () => typeof window !== 'undefined' && window.domo && window.domo.get;

/**
 * GET against a Domo API path. In production, uses window.domo.get.
 * In local dev, falls back to a relative fetch (assumes ryuu-cli proxy).
 */
export async function domoGet(path) {
  if (hasDomoRuntime()) {
    return window.domo.get(path);
  }
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Domo GET ${path} failed: ${res.status}`);
  return res.json();
}

/**
 * POST against a Domo API path.
 */
export async function domoPost(path, body) {
  if (hasDomoRuntime()) {
    return window.domo.post(path, body);
  }
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Domo POST ${path} failed: ${res.status}`);
  return res.json();
}

/**
 * Convenience: query rows from a mapped dataset by alias.
 *
 *   const rows = await getDatasetRows('sales', ['region', 'revenue']);
 *
 * Equivalent to: domoGet('/data/v1/sales?fields=region,revenue')
 */
export async function getDatasetRows(alias, fields = []) {
  const query = fields.length ? `?fields=${fields.join(',')}` : '';
  return domoGet(`/data/v1/${alias}${query}`);
}

/**
 * Tells you whether we're running inside Domo (true) or local dev (false).
 * Useful for conditional UI like "preview mode" banners.
 */
export const isDomoEnvironment = hasDomoRuntime;
