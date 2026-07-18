/**
 * lib/types.js
 * -----------------------------------------------------------------------
 * Shared JSDoc type definitions for the app's core data shapes.
 *
 * This project intentionally stays in plain JavaScript (no TypeScript
 * compiler step, which would add build complexity for a hackathon-scale
 * app) but still documents its data contracts formally via JSDoc
 * @typedef blocks. Editors and IDEs that understand JSDoc (VS Code, most
 * modern editors) get the same autocomplete/type-checking benefits as
 * TypeScript would provide, with zero build-tool risk.
 *
 * These types aren't imported at runtime — they exist purely so other
 * files can reference them in a `@param {GateStatus} ...` comment.
 * -----------------------------------------------------------------------
 */

/**
 * @typedef {Object} Gate
 * @property {string} id - Single-letter gate identifier, e.g. "A"
 * @property {string} name - Human-readable gate name
 * @property {number} x - SVG x-coordinate for StadiumMap rendering
 * @property {number} y - SVG y-coordinate for StadiumMap rendering
 * @property {number} baseCapacity - Approximate fan capacity at this gate
 */

/**
 * @typedef {Object} GateStatus
 * @property {string} gateId - References a {@link Gate}'s `id`
 * @property {string} name - Gate name, duplicated for display convenience
 * @property {number} density - Crowd density, 0-100
 * @property {"normal"|"busy"|"critical"} status - Derived from `density`
 */

/**
 * @typedef {Object} ChatMessage
 * @property {"user"|"assistant"} role
 * @property {string} content
 */

/**
 * @typedef {Object} TournamentContext
 * @property {string} tournament - e.g. "FIFA World Cup 2026"
 * @property {string} stage - e.g. "Group Stage — Matchday 2"
 * @property {string} venue - Host stadium name and city
 * @property {string[]} hostCities
 * @property {string} kickoffLocal
 * @property {number} expectedAttendance
 * @property {number} volunteerShiftsOnDuty
 */

/**
 * @typedef {Object} EmergencyProtocol
 * @property {string} label - Human-readable incident type
 * @property {string[]} steps - Standard response steps for this incident
 */

module.exports = {};
