import { useEffect } from "react";
import { Activity, CalendarClock, CircleDollarSign, MessageSquareText, ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import useDashboardStore from "../store/useDashboardStore";
import PageTransition from "../components/ui/PageTransition";
import StatCard from "../components/ui/StatCard";
import SkeletonCard from "../components/ui/SkeletonCard";
import { currency, dateTime } from "../utils/formatters";

const DashboardPage = () => {
  const { overview, timeseries, recentActivity, loading, fetchDashboard, error } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <PageTransition>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Profiles" value={overview?.totalProfiles || 0} icon={UsersRound} delta="+8.1% growth" />
            <StatCard label="Insurance Clients" value={overview?.insuranceClients || 0} icon={ShieldCheck} delta="+5.4% growth" />
            <StatCard label="TikTok Partners" value={overview?.tiktokCreators || 0} icon={UserRoundCheck} color="violet" delta="+12.6% growth" />
            <StatCard label="Daily Conversations" value={overview?.dailyMessages || 0} icon={MessageSquareText} />
            <StatCard label="Appointments" value={overview?.appointmentsToday || 0} icon={CalendarClock} />
            <StatCard label="Company Revenue" value={currency(overview?.companyRevenue || 0)} icon={CircleDollarSign} color="violet" />
          </section>

          <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <article className="glass neon-border rounded-2xl p-4">
              <div className="mb-4">
                <h3 className="font-display text-base font-semibold text-white">Weekly Analytics Pulse</h3>
                <p className="text-sm text-blue-100/65">Profiles, revenue, and messaging trends across modules</p>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer>
                  <AreaChart data={timeseries}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B6CFF" stopOpacity={0.34} />
                        <stop offset="95%" stopColor="#8B6CFF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F7CFF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4F7CFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(113,136,184,0.2)" />
                    <XAxis dataKey="day" stroke="#667085" fontSize={12} />
                    <YAxis stroke="#667085" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.96)",
                        border: "1px solid rgba(79,124,255,0.28)",
                        borderRadius: "10px",
                        color: "#1E2433"
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="messages" stroke="#4F7CFF" fillOpacity={1} fill="url(#colorMessages)" />
                    <Area type="monotone" dataKey="revenue" stroke="#8B6CFF" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="glass rounded-2xl p-4">
              <div className="mb-4 flex items-center gap-2">
                <Activity size={16} className="text-electric" />
                <h3 className="font-display text-base font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {recentActivity?.length ? (
                  recentActivity.map((entry) => (
                    <div key={entry._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm text-slate-100">{entry.message}</p>
                      <p className="mt-1 text-xs text-blue-100/55">{dateTime(entry.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-blue-100/60">No activity yet.</p>
                )}
              </div>
            </article>
          </section>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      )}
    </PageTransition>
  );
};

export default DashboardPage;
