/**
 * lib/cache.js
 * -----------------------------------------------------------------------
 * A tiny in-memory, TTL-based cache for serverless API routes.
 *
 * Why this exists: the operational briefing in /api/insights is grounded
 * in crowd data that only changes once a minute (see
 * `getLiveCrowdDensity`'s minute-seed in lib/stadiumData.js). Without a
 * cache, every dashboard page load — even from multiple stewards at the
 * same time — triggers a brand-new LLM call for output that would be
 * identical anyway. Caching by the same minute-seed cuts redundant model
 * calls, latency, and cost with zero loss of freshness.
 *
 * Note: this cache lives in the memory of a single serverless function
 * instance, so it's a best-effort optimization (a cold start or a
 * different instance will simply recompute) rather than a distributed
 * cache — appropriate for this scale without adding infrastructure.
 * -----------------------------------------------------------------------
 */

const store = new Map();

/**
 * @param {string} key
 * @param {() => Promise<any>} computeFn - only called on a cache miss
 * @param {number} [ttlMs=60000] - how long the cached value stays valid
 */
async function getOrCompute(key, computeFn, ttlMs = 60_000) {
  const cached = store.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttlMs) {
    return { value: cached.value, cached: true };
  }

  const value = await computeFn();
  store.set(key, { value, timestamp: now });
  return { value, cached: false };
}

module.exports = { getOrCompute };
