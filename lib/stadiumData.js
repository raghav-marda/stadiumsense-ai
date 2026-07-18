/**
 * lib/stadiumData.js
 * -----------------------------------------------------------------------
 * Mock "digital twin" data for a FIFA World Cup 2026 stadium.
 * In production this would be swapped for live IoT sensor feeds, a
 * transit API, and a venue CMS — the shape of the data is designed so
 * that swap requires no changes to the AI orchestrator or UI layer.
 * -----------------------------------------------------------------------
 */

const GATES = [
  { id: "A", name: "Gate A — North Plaza", x: 400, y: 40, baseCapacity: 12000 },
  { id: "B", name: "Gate B — East Concourse", x: 720, y: 220, baseCapacity: 9000 },
  { id: "C", name: "Gate C — South Plaza", x: 400, y: 400, baseCapacity: 12000 },
  { id: "D", name: "Gate D — West Concourse", x: 80, y: 220, baseCapacity: 9000 },
  { id: "E", name: "Gate E — Accessible Entry", x: 250, y: 400, baseCapacity: 3000 },
];

const SECTIONS = [
  { id: "S1", name: "Lower Bowl North", nearestGate: "A" },
  { id: "S2", name: "Lower Bowl East", nearestGate: "B" },
  { id: "S3", name: "Lower Bowl South", nearestGate: "C" },
  { id: "S4", name: "Lower Bowl West", nearestGate: "D" },
  { id: "S5", name: "Accessible Seating", nearestGate: "E" },
  { id: "S6", name: "Upper Tier North", nearestGate: "A" },
];

const AMENITIES = [
  { id: "med1", type: "medical", name: "First Aid Post 1", near: "A" },
  { id: "med2", type: "medical", name: "First Aid Post 2", near: "C" },
  { id: "wash1", type: "washroom", name: "Restroom Block North", near: "A" },
  { id: "wash2", type: "washroom", name: "Restroom Block South", near: "C" },
  { id: "food1", type: "food", name: "Fan Zone Food Court", near: "B" },
  { id: "info1", type: "info", name: "Volunteer Help Desk", near: "D" },
];

const TRANSPORT_OPTIONS = [
  { mode: "Metro", line: "Blue Line", nearestGate: "A", etaMinutes: 8, status: "On time" },
  { mode: "Shuttle Bus", line: "Fan Shuttle 3", nearestGate: "D", etaMinutes: 12, status: "On time" },
  { mode: "Ride-share Pickup", line: "Zone 2", nearestGate: "B", etaMinutes: 5, status: "Busy — expect delay" },
  { mode: "Parking", line: "Lot P4", nearestGate: "C", etaMinutes: 0, status: "78% full" },
];

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "fr", label: "Français (French)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "pt", label: "Português (Portuguese)" },
];

const EMERGENCY_PROTOCOLS = {
  medical: {
    label: "Medical Emergency",
    steps: [
      "Alert nearest First Aid Post and dispatch medical staff",
      "Clear a path from the incident location to the nearest exit",
      "Notify stadium control room and log incident timestamp",
    ],
  },
  overcrowding: {
    label: "Overcrowding / Crowd Crush Risk",
    steps: [
      "Halt entry at the affected gate temporarily",
      "Redirect incoming fans to the nearest low-density gate",
      "Deploy additional stewards to affected concourse",
    ],
  },
  fire: {
    label: "Fire / Smoke Report",
    steps: [
      "Trigger nearest fire suppression / alarm protocol",
      "Begin phased evacuation starting with the closest section",
      "Notify local fire services and stadium safety officer",
    ],
  },
  lost_person: {
    label: "Lost Person / Child",
    steps: [
      "Broadcast description to all gate stewards",
      "Direct family to nearest Volunteer Help Desk",
      "Check nearest info points and medical posts first",
    ],
  },
};

/**
 * Deterministic-but-varied mock "live" crowd density per gate, 0-100.
 * Uses a seeded pseudo-random so repeated calls in the same minute are
 * stable (useful for demos), while still changing over time.
 */
function getLiveCrowdDensity() {
  const minuteSeed = Math.floor(Date.now() / 60000);
  return GATES.map((gate, i) => {
    const seed = (minuteSeed + i * 17) % 100;
    const density = Math.round(30 + Math.abs(Math.sin(seed)) * 65); // 30-95 range
    return {
      gateId: gate.id,
      name: gate.name,
      density,
      status: density > 80 ? "critical" : density > 55 ? "busy" : "normal",
    };
  });
}

/**
 * Tournament-level context (as opposed to single-stadium data above).
 * "Smart Stadiums & Tournament Operations" covers both: a venue on a
 * single match day, and the wider tournament schedule that organizers
 * and volunteers have to operate across. This grounds the AI's
 * operational-intelligence and real-time decision-support answers in
 * an actual FIFA World Cup 2026 match context, not just a generic venue.
 */
const TOURNAMENT_CONTEXT = {
  tournament: "FIFA World Cup 2026",
  stage: "Group Stage — Matchday 2",
  venue: "MetLife Stadium, East Rutherford, NJ",
  hostCities: [
    "New York/New Jersey",
    "Los Angeles",
    "Dallas",
    "Toronto",
    "Mexico City",
    "Miami",
  ],
  kickoffLocal: "19:00 ET",
  expectedAttendance: 82500,
  volunteerShiftsOnDuty: 340,
};

module.exports = {
  GATES,
  SECTIONS,
  AMENITIES,
  TRANSPORT_OPTIONS,
  SUPPORTED_LANGUAGES,
  EMERGENCY_PROTOCOLS,
  TOURNAMENT_CONTEXT,
  getLiveCrowdDensity,
};
