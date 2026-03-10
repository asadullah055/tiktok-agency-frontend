export const centralRecentCallsData = [
  {
    id: "1",
    contact_name: "Contact Alpha",
    phone_number: "+44 7XXX XXX001",
    assistant: "AI Assistant A",
    outcome: "Meeting booked",
    timestamp: "2024-01-15T14:30:00Z",
    duration: "2:04"
  },
  {
    id: "2",
    contact_name: "Contact Beta",
    phone_number: "+44 7XXX XXX002",
    assistant: "AI Assistant B",
    outcome: "Callback requested",
    timestamp: "2024-01-15T14:25:00Z",
    duration: "1:42"
  },
  {
    id: "3",
    contact_name: "Contact Gamma",
    phone_number: "+44 7XXX XXX003",
    assistant: "AI Assistant A",
    outcome: "Voicemail",
    timestamp: "2024-01-15T14:20:00Z",
    duration: "0:48"
  },
  {
    id: "4",
    contact_name: "Contact Delta",
    phone_number: "+44 7XXX XXX004",
    assistant: "AI Assistant C",
    outcome: "Not interested",
    timestamp: "2024-01-15T14:15:00Z",
    duration: "1:15"
  },
  {
    id: "5",
    contact_name: "Contact Echo",
    phone_number: "+44 7XXX XXX005",
    assistant: "AI Assistant B",
    outcome: "Customer ended call",
    timestamp: "2024-01-15T14:10:00Z",
    duration: "1:22"
  },
  {
    id: "6",
    contact_name: "Contact Foxtrot",
    phone_number: "+44 7XXX XXX006",
    assistant: "AI Assistant A",
    outcome: "Failed to connect",
    timestamp: "2024-01-15T14:05:00Z",
    duration: "0:32"
  },
  {
    id: "7",
    contact_name: "Contact Golf",
    phone_number: "+44 7XXX XXX007",
    assistant: "AI Assistant C",
    outcome: "Meeting booked",
    timestamp: "2024-01-15T14:00:00Z",
    duration: "1:58"
  },
  {
    id: "8",
    contact_name: "Contact Hotel",
    phone_number: "+44 7XXX XXX008",
    assistant: "AI Assistant B",
    outcome: "Callback requested",
    timestamp: "2024-01-15T13:55:00Z",
    duration: "1:05"
  }
];

const centralAnalyticsData = {
  callOutcomes: [
    { name: "Meeting booked" },
    { name: "Callback requested" },
    { name: "Voicemail" },
    { name: "Not interested" },
    { name: "Customer ended call" },
    { name: "Failed to connect" },
    { name: "No answer" },
    { name: "Test call" }
  ]
};

export const getRecentCalls = () => centralRecentCallsData;

export const getAnalyticsData = () => centralAnalyticsData;

export const generateCallDuration = (outcome) => {
  const normalized = String(outcome || "").toLowerCase();

  if (normalized === "meeting booked") {
    return `${Math.floor(Math.random() * 2) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;
  }

  if (normalized === "callback requested") {
    return `${Math.floor(Math.random() * 2) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;
  }

  if (normalized === "failed to connect" || normalized === "no answer") {
    return `0:${String(Math.floor(Math.random() * 40) + 20).padStart(2, "0")}`;
  }

  return `${Math.floor(Math.random() * 2) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;
};

export const generateExtendedDates = (totalRecords = 50) => {
  const dates = [];
  const now = new Date();
  const maxCallsPerDay = 2;
  const daysNeeded = Math.ceil(totalRecords / maxCallsPerDay);

  for (let dayIndex = 0; dayIndex < daysNeeded; dayIndex += 1) {
    const callDay = new Date(now);
    callDay.setDate(now.getDate() - dayIndex);

    const callsToday = Math.min(maxCallsPerDay, totalRecords - dates.length);
    for (let slot = 0; slot < callsToday; slot += 1) {
      const stamp = new Date(callDay);
      stamp.setHours(17 - slot * 2, 50 - dayIndex, Math.floor(Math.random() * 59));
      dates.push(stamp.toISOString());
    }
  }

  return dates;
};
