/**
 * lib/formatApiError.js
 * -----------------------------------------------------------------------
 * Every page that calls one of our own /api/* routes needs to turn a
 * failed response into a readable message. Before this existed, that
 * "if there's a detail, append it in parens, otherwise fall back to a
 * generic message" logic was copy-pasted in three places (fan.js twice,
 * staff.js twice more). Centralizing it means a future change to error
 * formatting (e.g. redacting a field, changing the separator) happens
 * once, not four times with the risk of drifting out of sync.
 * -----------------------------------------------------------------------
 */

/**
 * @param {{ error?: string, detail?: string }} data - parsed JSON body of
 *   a failed API response
 * @param {string} [fallback] - message to use if `data.error` is missing
 * @returns {string}
 */
function formatApiError(data, fallback = "Something went wrong. Please try again.") {
  if (!data) return fallback;
  const message = data.error || fallback;
  return data.detail ? `${message} (${data.detail})` : message;
}

module.exports = { formatApiError };
