import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageTransition from "../components/ui/PageTransition";
import DataTable from "../components/ui/DataTable";
import StatCard from "../components/ui/StatCard";
import { fetchMessages, fetchMessageStats } from "../services/tiktokService";
import { dateTime } from "../utils/formatters";

const deliveryStatusOptions = [
  { value: "all", label: "All Status" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "delivery_failed", label: "Delivery Failed" },
  { value: "reply", label: "Reply" }
];

const deliveryStatusLabelMap = {
  sent: "Sent",
  delivered: "Delivered",
  delivery_failed: "Delivery Failed",
  failed: "Delivery Failed",
  reply: "Reply",
  queued: "Queued"
};

const formatDeliveryStatus = (status) => deliveryStatusLabelMap[status] || status || "-";

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ sent: 0, delivered: 0, deliveryFailed: 0, reply: 0 });
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    try {
      const messageParams = statusFilter === "all" ? {} : { deliveryStatus: statusFilter };
      const [history, statsData] = await Promise.all([fetchMessages(messageParams), fetchMessageStats()]);
      setMessages(history);
      setStats(statsData);
    } catch (error) {
      toast.error(error.message || "Failed to load conversations");
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const columns = [
    { key: "creator", label: "Partner", render: (row) => row.profile?.tiktokData?.creatorName || row.profile?.name || "-" },
    { key: "platform", label: "Platform" },
    { key: "content", label: "Conversation", render: (row) => <span className="inline-block max-w-lg truncate">{row.content}</span> },
    { key: "deliveryStatus", label: "Delivery", render: (row) => formatDeliveryStatus(row.deliveryStatus) },
    { key: "sentAt", label: "Sent At", render: (row) => dateTime(row.sentAt) }
  ];

  return (
    <PageTransition>
      <div className="space-y-4">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Sent" value={stats.sent} />
          <StatCard label="Delivered" value={stats.delivered} />
          <StatCard label="Delivery Failed" value={stats.deliveryFailed} />
          <StatCard label="Reply" value={stats.reply} color="violet" />
        </section>

        <section className="glass space-y-3 rounded-2xl p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-base font-semibold text-white">Conversation History</h3>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="sm:min-w-36 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-electric/60 focus:outline-none">
              {deliveryStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Send conversation section commented as requested.
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
            <select {...register("profile", { required: true })} className={inputClass}>
              <option value="">Select partner</option>
              {creators.map((creator) => (
                <option key={creator._id} value={creator._id}>
                  {creator.tiktokData?.creatorName || creator.name}
                </option>
              ))}
            </select>
            <select {...register("platform")} className={inputClass}>
              <option value="telegram">Telegram</option>
            </select>
            <input
              {...register("content", { required: true })}
              placeholder="Write a natural partner conversation..."
              className="md:col-span-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-blue-100/45 focus:border-electric/60 focus:outline-none"
            />
            <button type="submit" className="rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white md:col-span-4">
              Send Conversation
            </button>
          </form>
          */}

          <DataTable columns={columns} rows={messages} emptyMessage="No conversation found for this status." />
        </section>
      </div>
    </PageTransition>
  );
};

export default MessagesPage;
