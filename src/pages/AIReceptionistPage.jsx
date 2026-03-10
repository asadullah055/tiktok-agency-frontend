import { Clock, Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageTransition from "../components/ui/PageTransition";
import { generateCallDuration, generateExtendedDates, getAnalyticsData, getRecentCalls } from "../data/centralData";

const generateCallHistory = () => {
  const recentCalls = getRecentCalls();
  const analyticsData = getAnalyticsData();
  const callRecords = [];
  const totalRecords = 50;
  const callDates = generateExtendedDates(totalRecords);
  const customersWithMeetings = new Set();

  for (let i = 0; i < totalRecords; i += 1) {
    const customerId = `Contact ${String.fromCharCode(65 + (i % 15))}`;
    if (Math.random() < 0.2) {
      customersWithMeetings.add(customerId);
    }
  }

  for (let i = 0; i < totalRecords; i += 1) {
    const baseCall = recentCalls[i % recentCalls.length];
    const customerId = `Contact ${String.fromCharCode(65 + (i % 15))}`;
    const hasMeeting = customersWithMeetings.has(customerId);

    let selectedOutcome;
    if (hasMeeting && i < 3) {
      selectedOutcome = analyticsData.callOutcomes.find((entry) => entry.name.toLowerCase() === "meeting booked");
    } else {
      const progressionOutcomes = analyticsData.callOutcomes.filter((entry) => entry.name.toLowerCase() !== "meeting booked");
      selectedOutcome = progressionOutcomes[Math.floor(Math.random() * progressionOutcomes.length)];
    }

    if (!selectedOutcome) {
      selectedOutcome = analyticsData.callOutcomes[0];
    }

    callRecords.push({
      id: `call-${i + 1}`,
      customer: customerId,
      phoneNumber: `+44 7XXX XXX${String((i % 15) + 1).padStart(3, "0")}`,
      agent: baseCall.assistant,
      outcome: selectedOutcome.name,
      duration: generateCallDuration(selectedOutcome.name),
      date: callDates[i] || new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Contact was responsive and showed interest in the service offering."
    });
  }

  return callRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const AIReceptionistPage = () => {
  const [callRecords, setCallRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const records = generateCallHistory();
    setCallRecords(records);
    setIsLoading(false);
  }, []);

  const filteredRecords = useMemo(() => {
    let filtered = [...callRecords];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.customer?.toLowerCase().includes(term) ||
          record.phoneNumber?.includes(searchTerm) ||
          record.agent?.toLowerCase().includes(term)
      );
    }

    if (outcomeFilter !== "all") {
      filtered = filtered.filter((record) => record.outcome === outcomeFilter);
    }

    if (agentFilter !== "all") {
      filtered = filtered.filter((record) => record.agent === agentFilter);
    }

    return filtered;
  }, [agentFilter, callRecords, outcomeFilter, searchTerm]);

  const outcomes = useMemo(() => [...new Set(callRecords.map((record) => record.outcome))], [callRecords]);
  const agents = useMemo(() => [...new Set(callRecords.map((record) => record.agent))], [callRecords]);

  const getOutcomeBadgeClass = (outcome) => {
    const normalized = String(outcome || "").trim().toLowerCase();

    switch (normalized) {
      case "meeting booked":
        return "bg-[#dcfce7] text-[#047857] border border-[#a7f3d0]";
      case "callback requested":
        return "bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe]";
      case "voicemail":
        return "bg-[#fef3c7] text-[#b45309] border border-[#fde68a]";
      case "not interested":
        return "bg-[#fee2e2] text-[#be123c] border border-[#fecaca]";
      case "customer ended call":
        return "bg-[#e2e8f0] text-[#334155] border border-[#cbd5e1]";
      case "failed to connect":
        return "bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3]";
      case "no answer":
        return "bg-[#eaf2ff] text-[#355188] border border-[#cdddff]";
      case "test call":
        return "bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff]";
      default:
        return "bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]";
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="glass rounded-2xl border border-[#d8e2f2] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#1f2a44]">AI Receptionist Call History</h1>
              <p className="text-sm text-[#5c6985]">
                {filteredRecords.length} of {callRecords.length} calls
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d3ddef] bg-[#f9fbff] px-4 py-2 text-sm font-medium text-[#33466b] transition-colors hover:bg-white"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer, phone, or agent..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-[#d3ddef] bg-white py-2 pl-10 pr-4 text-sm text-[#26324d] focus:border-[#8ba5db] focus:outline-none"
              />
            </div>

            {showFilters ? (
              <div className="grid grid-cols-1 gap-4 border-t border-[#e1e8f5] pt-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4b5c7f]">Outcome</label>
                  <select
                    value={outcomeFilter}
                    onChange={(event) => setOutcomeFilter(event.target.value)}
                    className="w-full rounded-lg border border-[#d3ddef] bg-white px-3 py-2 text-sm text-[#26324d] focus:border-[#8ba5db] focus:outline-none"
                  >
                    <option value="all">All Outcomes</option>
                    {outcomes.map((outcome) => (
                      <option key={outcome} value={outcome}>
                        {outcome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4b5c7f]">Agent</label>
                  <select
                    value={agentFilter}
                    onChange={(event) => setAgentFilter(event.target.value)}
                    className="w-full rounded-lg border border-[#d3ddef] bg-white px-3 py-2 text-sm text-[#26324d] focus:border-[#8ba5db] focus:outline-none"
                  >
                    <option value="all">All Agents</option>
                    {agents.map((agent) => (
                      <option key={agent} value={agent}>
                        {agent}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#d8e2f2] bg-white shadow-[0_8px_26px_rgba(68,94,152,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#dce6f7] bg-[#edf3ff]">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5e7196]">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5e7196]">Phone</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5e7196]">Agent</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5e7196]">Outcome</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5e7196]">Duration</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5e7196]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ecf8]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#667799]">
                      Loading call history...
                    </td>
                  </tr>
                ) : filteredRecords.length ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="bg-white transition-colors hover:bg-[#f8fbff]">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-[#1f2a44]">{record.customer}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#4f5f80]">{record.phoneNumber}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#4f5f80]">{record.agent}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex min-w-[108px] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getOutcomeBadgeClass(record.outcome)}`}>
                          {record.outcome}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#4f5f80]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {record.duration}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#4f5f80]">
                        {new Date(record.date).toLocaleDateString()}{" "}
                        {new Date(record.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#667799]">
                      No calls found. Try adjusting your search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AIReceptionistPage;
