import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Activity, CircleDollarSign, MessageSquareText, UserRoundCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageTransition from "../components/ui/PageTransition";
import StatCard from "../components/ui/StatCard";
import DataTable from "../components/ui/DataTable";
import { fetchCreators, fetchDailyData, fetchMessages, fetchMessageStats } from "../services/tiktokService";
import { fetchIncomeRecords, fetchIncomeSummary } from "../services/incomeService";
import { currency, dateOnly } from "../utils/formatters";

const tooltipStyle = {
  background: "rgba(255,255,255,0.96)",
  border: "1px solid rgba(79,124,255,0.28)",
  borderRadius: "10px",
  color: "#1E2433"
};

const getDayKey = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const isInCurrentMonth = (value) => {
  const date = new Date(value);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const getIncomeValue = (record) => Number(record?.totalRevenue ?? record?.amount ?? 0);

const TikTokOverviewPage = () => {
  const [creators, setCreators] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageStats, setMessageStats] = useState({ sent: 0, delivered: 0, deliveryFailed: 0, reply: 0 });
  const [incomeRecords, setIncomeRecords] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState({ totalIncome: 0, recordCount: 0, byType: [] });

  const load = async () => {
    try {
      const [creatorRows, dailyRows, messageRows, statsRows, incomeRows, incomeSummaryRows] = await Promise.all([
        fetchCreators(),
        fetchDailyData(),
        fetchMessages(),
        fetchMessageStats(),
        fetchIncomeRecords(),
        fetchIncomeSummary()
      ]);

      setCreators(creatorRows);
      setDailyRecords(dailyRows);
      setMessages(messageRows);
      setMessageStats(statsRows);
      setIncomeRecords(incomeRows);
      setIncomeSummary(incomeSummaryRows);
    } catch (error) {
      toast.error(error.message || "Failed to load TikTok overview");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const todayKey = useMemo(() => getDayKey(new Date()), []);

  const overviewStats = useMemo(() => {
    const todayDailyRows = dailyRecords.filter((record) => getDayKey(record.date) === todayKey);
    const todayIncomeRows = incomeRecords.filter((record) => getDayKey(record.date) === todayKey);

    const uniqueCountries = new Set(
      creators
        .map((creator) => creator?.tiktokData?.country)
        .filter(Boolean)
        .map((country) => country.trim().toLowerCase())
    );

    const totalDeliveries =
      Number(messageStats.sent || 0) +
      Number(messageStats.delivered || 0) +
      Number(messageStats.deliveryFailed || 0) +
      Number(messageStats.reply || 0);
    const successfulDeliveries = Number(messageStats.sent || 0) + Number(messageStats.delivered || 0);
    const sentRate = totalDeliveries ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 0;

    const monthlyIncome = incomeRecords
      .filter((record) => isInCurrentMonth(record.date))
      .reduce((sum, record) => sum + getIncomeValue(record), 0);

    const todayIncome = todayIncomeRows.reduce((sum, record) => sum + getIncomeValue(record), 0);
    const todayLiveHours = todayDailyRows.reduce((sum, record) => sum + Number(record.liveHours || 0), 0);

    return {
      totalCreators: creators.length,
      activeCountries: uniqueCountries.size,
      todayDailyEntries: todayDailyRows.length,
      todayLiveHours,
      totalMessages: messages.length,
      sentRate,
      monthlyIncome,
      todayIncome,
      totalIncome: Number(incomeSummary.totalIncome ?? incomeSummary.totalRevenue ?? 0),
      topIncomeType: incomeSummary.byType?.[0]?.incomeType || "-"
    };
  }, [creators, dailyRecords, incomeRecords, incomeSummary, messageStats, messages.length, todayKey]);

  const trendData = useMemo(() => {
    const buckets = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      return {
        key: date.getTime(),
        day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        income: 0,
        messages: 0,
        activeCreators: 0
      };
    });

    const byDay = Object.fromEntries(buckets.map((bucket) => [bucket.key, bucket]));

    incomeRecords.forEach((record) => {
      const key = getDayKey(record.date);
      if (byDay[key]) {
        byDay[key].income += getIncomeValue(record);
      }
    });

    messages.forEach((record) => {
      const key = getDayKey(record.sentAt || record.createdAt);
      if (byDay[key]) {
        byDay[key].messages += 1;
      }
    });

    dailyRecords.forEach((record) => {
      const key = getDayKey(record.date);
      if (byDay[key]) {
        byDay[key].activeCreators += 1;
      }
    });

    return buckets;
  }, [dailyRecords, incomeRecords, messages]);

  const recentDailyRows = useMemo(() => dailyRecords.slice(0, 6), [dailyRecords]);
  const recentCreators = useMemo(() => creators.slice(0, 6), [creators]);

  const dailyColumns = [
    { key: "creator", label: "Partner", render: (row) => row.profile?.tiktokData?.creatorName || row.profile?.name || "-" },
    { key: "date", label: "Date", render: (row) => dateOnly(row.date) },
    { key: "gifts", label: "Gifts" },
    { key: "income", label: "Revenew", render: (row) => currency(Number(row.income || 0)) },
    { key: "liveHours", label: "Live Hours" }
  ];

  return (
    <PageTransition>
      <div className="space-y-4">
        <section className="glass neon-border rounded-2xl p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">TikTok Agency Full Overview</h2>
              <p className="mt-2 text-sm text-blue-100/70">
                Partners, daily operations, conversation delivery, and revenew performance in one consolidated view.
              </p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-2">
              <Link to="/tiktok/creators" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-center text-sm text-white hover:bg-white/10">
                Manage Partners
              </Link>
              <Link to="/tiktok/daily-data" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-center text-sm text-white hover:bg-white/10">
                Creators
              </Link>
              <Link to="/tiktok/messages" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-center text-sm text-white hover:bg-white/10">
                Conversation Center
              </Link>
              <Link to="/tiktok/income" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-center text-sm text-white hover:bg-white/10">
                Revenew Ledger
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Partners" value={overviewStats.totalCreators} icon={UserRoundCheck} />
          <StatCard label="Today's Daily Entries" value={overviewStats.todayDailyEntries} icon={Activity} />
          <StatCard label="Total Conversations" value={overviewStats.totalMessages} icon={MessageSquareText} />
          <StatCard label="Total Revenew" value={currency(overviewStats.totalIncome)} icon={CircleDollarSign} color="violet" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <article className="glass neon-border rounded-2xl p-4">
            <h3 className="font-display text-base font-semibold text-white">7-Day Agency Pulse</h3>
            <p className="mb-4 text-sm text-blue-100/65">Revenew, conversation volume, and active partner activity trend.</p>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(113,136,184,0.2)" />
                  <XAxis dataKey="day" stroke="#667085" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#667085" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#667085" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar yAxisId="left" dataKey="income" fill="#8B6CFF" radius={[6, 6, 0, 0]} name="Revenew" />
                  <Bar yAxisId="right" dataKey="messages" fill="#4F7CFF" radius={[6, 6, 0, 0]} name="Conversations" />
                  <Bar yAxisId="right" dataKey="activeCreators" fill="#4FAF8F" radius={[6, 6, 0, 0]} name="Active Partners" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass rounded-2xl p-4">
            <h3 className="font-display text-base font-semibold text-white">Operational Snapshot</h3>
            <ul className="mt-4 space-y-3 text-sm text-blue-100/80">
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span>Delivery Sent Rate</span>
                <strong className="text-white">{overviewStats.sentRate}%</strong>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span>Today's Revenew</span>
                <strong className="text-white">{currency(overviewStats.todayIncome)}</strong>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span>This Month Revenew</span>
                <strong className="text-white">{currency(overviewStats.monthlyIncome)}</strong>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span>Today's Live Hours</span>
                <strong className="text-white">{overviewStats.todayLiveHours.toFixed(1)}</strong>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span>Active Countries</span>
                <strong className="text-white">{overviewStats.activeCountries}</strong>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span>Top Revenew Type</span>
                <strong className="text-white">{overviewStats.topIncomeType}</strong>
              </li>
            </ul>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_2fr]">
          <article className="glass rounded-2xl p-4">
            <h3 className="mb-3 font-display text-base font-semibold text-white">Recent Partners</h3>
            <div className="space-y-2">
              {recentCreators.length ? (
                recentCreators.map((creator) => (
                  <div key={creator._id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-sm font-medium text-white">{creator.tiktokData?.creatorName || creator.name}</p>
                    <p className="text-xs text-blue-100/70">
                      @{creator.tiktokData?.tiktokUsername || "unknown"}
                      {creator.tiktokData?.country ? ` | ${creator.tiktokData.country}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-blue-100/60">No partners yet.</p>
              )}
            </div>
          </article>

          <article className="space-y-2">
            <h3 className="px-1 font-display text-base font-semibold text-white">Recent Daily Performance</h3>
            <DataTable columns={dailyColumns} rows={recentDailyRows} emptyMessage="No daily performance records found." />
          </article>
        </section>
      </div>
    </PageTransition>
  );
};

export default TikTokOverviewPage;
