import { useEffect, useState } from "react";
import { Copy, Eye } from "lucide-react";
import toast from "react-hot-toast";
import ModalForm from "../components/ui/ModalForm";
import DataTable from "../components/ui/DataTable";
import PageTransition from "../components/ui/PageTransition";
import { getIdealUsers } from "../services/idealUserService";
import { fetchDailyData } from "../services/tiktokService";

const mockDailyRows = Array.from({ length: 20 }, (_, index) => {
  return {
    id: `sample-daily-${index + 1}`,
    username: `Demo user ${index + 1}`,
    diamonds: 4500 + index * 350,
    revenew: 220 + index * 14
  };
});

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 0
});

const wholeNumber = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0
});

const formatTikTokUrl = (username) => `https://www.tiktok.com/@${String(username || "").replace(/^@/, "").trim()}`;
const roundNumber = (value) => Math.round(Number(value || 0));
const sumFromDays = (days, field) => days.reduce((sum, day) => sum + roundNumber(day?.[field]), 0);

const DailyDataPage = () => {
  const [demoRows, setDemoRows] = useState([]);
  const [idealRows, setIdealRows] = useState([]);
  const [activeView, setActiveView] = useState("demo");
  const [selectedIdealRow, setSelectedIdealRow] = useState(null);

  const loadDemoRows = async () => {
    try {
      const records = await fetchDailyData();
      const safeRecords = Array.isArray(records) ? records : [];
      const normalizedRecords = safeRecords.map((row, index) => ({
        id: row._id || row.id || `daily-${index + 1}`,
        username: row.profile?.tiktokData?.creatorName || row.profile?.name || row.username || "-",
        diamonds: Number(row.diamonds || 0),
        revenew: Number(row.revenew || row.income || 0)
      }));
      const rowsWithSamples =
        normalizedRecords.length >= mockDailyRows.length
          ? normalizedRecords
          : [...normalizedRecords, ...mockDailyRows.slice(0, mockDailyRows.length - normalizedRecords.length)];
      setDemoRows(rowsWithSamples);
    } catch (error) {
      setDemoRows(mockDailyRows);
      toast.error(error.message || "Live data unavailable, showing sample records");
    }
  };

  const loadIdealRows = async () => {
    const users = await getIdealUsers();
    const normalized = users.map((user, index) => {
      const safeDays = Array.isArray(user.days) ? user.days : [];

      return {
        id: user._id || user.id || `ideal-user-${index}`,
        name: user.name || "-",
        username: user.username || `ideal-user-${index + 1}`,
        totalDiamonds: safeDays.length ? sumFromDays(safeDays, "diamonds") : roundNumber(user.totalDiamonds ?? user.diamonds),
        totalIncome: safeDays.length ? sumFromDays(safeDays, "income") : roundNumber(user.totalIncome ?? user.revenew),
        dbTotalDiamonds: roundNumber(user.totalDiamonds ?? user.diamonds),
        dbTotalIncome: roundNumber(user.totalIncome ?? user.revenew),
        daysCount: Number(user.daysCount ?? safeDays.length),
        days: safeDays.map((day) => ({
          ...day,
          income: roundNumber(day?.income),
          diamonds: roundNumber(day?.diamonds)
        }))
      };
    });
    setIdealRows(normalized);
  };

  useEffect(() => {
    loadDemoRows();
    loadIdealRows().catch((error) => toast.error(error.message || "Failed to load ideal users"));
  }, []);

  const demoColumns = [
    { key: "username", label: "Username" },
    { key: "diamonds", label: "Diamonds" },
    { key: "revenew", label: "Revenew ($)" }
  ];

  const handleCopyProfileUrl = async (username) => {
    const profileUrl = formatTikTokUrl(username);

    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("TikTok profile URL copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const idealColumns = [
    { key: "name", label: "Name" },
    {
      key: "username",
      label: "Username",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.username}</span>
          <button
            type="button"
            onClick={() => handleCopyProfileUrl(row.username)}
            className="rounded-md border border-white/10 bg-white/5 p-1 text-blue-100/70 hover:border-electric/55 hover:text-white"
            title="Copy TikTok profile URL"
          >
            <Copy size={14} />
          </button>
        </div>
      )
    },
    {
      key: "totalDiamonds",
      label: "Total Diamonds",
      render: (row) => <span title={wholeNumber.format(row.totalDiamonds)}>{compactNumber.format(row.totalDiamonds)}</span>
    },
    { key: "totalIncome", label: "Total USD", render: (row) => wholeNumber.format(row.totalIncome) },
    { key: "daysCount", label: "Days" },
    {
      key: "details",
      label: "Details",
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedIdealRow(row)}
          className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-2 text-blue-100/70 hover:border-electric/55 hover:text-white"
          title="View details"
        >
          <Eye size={15} />
        </button>
      )
    }
  ];

  return (
    <PageTransition>
      <section className="space-y-4">
        <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
          <p className="text-sm text-blue-100/70">Choose which creator data you want to view.</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView("demo")}
              className={`rounded-xl px-4 py-2 text-sm ${
                activeView === "demo"
                  ? "bg-gradient-to-r from-electric to-violet text-white"
                  : "border border-white/15 bg-white/5 text-blue-100 hover:border-electric/55"
              }`}
            >
              Demo Creator
            </button>
            <button
              type="button"
              onClick={() => {
                loadIdealRows().catch((error) => toast.error(error.message || "Failed to load ideal users"));
                setActiveView("ideal");
              }}
              className={`rounded-xl px-4 py-2 text-sm ${
                activeView === "ideal"
                  ? "bg-gradient-to-r from-electric to-violet text-white"
                  : "border border-white/15 bg-white/5 text-blue-100 hover:border-electric/55"
              }`}
            >
              Ideal Creator
            </button>
          </div>
        </div>

        {/* Save Daily Data section kept commented as requested. */}
        {/*
        <form onSubmit={submit} className="glass grid gap-3 rounded-2xl p-4 md:grid-cols-2 xl:grid-cols-6">
          <select {...register("profile", { required: true })} className={inputClass}>
            <option value="">Select partner</option>
            {creators.map((creator) => (
              <option key={creator._id} value={creator._id}>
                {creator.tiktokData?.creatorName || creator.name}
              </option>
            ))}
          </select>
          <input type="date" {...register("date", { required: true })} className={inputClass} />
          <input type="number" step="1" min="0" {...register("gifts")} placeholder="Gifts" className={inputClass} />
          <input type="number" step="1" min="0" {...register("diamonds")} placeholder="Diamonds" className={inputClass} />
          <input type="number" step="0.01" min="0" {...register("income")} placeholder="Revenew" className={inputClass} />
          <input type="number" step="0.1" min="0" {...register("liveHours")} placeholder="Live Hours" className={inputClass} />
          <button type="submit" className="rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white md:col-span-2 xl:col-span-6">
            Save Daily Data
          </button>
        </form>
        */}

        <DataTable
          columns={activeView === "ideal" ? idealColumns : demoColumns}
          rows={activeView === "ideal" ? idealRows : demoRows}
          emptyMessage={activeView === "ideal" ? "No ideal creator found. Add one from Telegram settings." : "No demo creator records found."}
        />
      </section>

      <ModalForm
        open={Boolean(selectedIdealRow)}
        onClose={() => setSelectedIdealRow(null)}
        title={selectedIdealRow ? `${selectedIdealRow.name} Details` : "Creator Details"}
        panelClassName="max-w-5xl"
      >
        {selectedIdealRow ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-blue-100/55">Creator</p>
              <p className="mt-1 text-sm text-slate-100">
                {selectedIdealRow.name} ({selectedIdealRow.username})
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-electric/20 to-violet/10 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Last 30 Days Income</p>
                <p className="mt-2 text-3xl font-semibold text-white">${wholeNumber.format(selectedIdealRow.totalIncome)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet/15 to-electric/10 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Last 30 Days Diamonds</p>
                <p className="mt-2 text-3xl font-semibold text-white">{wholeNumber.format(selectedIdealRow.totalDiamonds)}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-blue-100/55">Total USD</p>
                <p className="mt-1 text-sm text-slate-100">${wholeNumber.format(selectedIdealRow.dbTotalIncome)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-blue-100/55">Total Diamonds</p>
                <p className="mt-1 text-sm text-slate-100">{wholeNumber.format(selectedIdealRow.dbTotalDiamonds)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-blue-100/55">Total Days</p>
                <p className="mt-1 text-sm text-slate-100">{wholeNumber.format(selectedIdealRow.daysCount)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </ModalForm>
    </PageTransition>
  );
};

export default DailyDataPage;
