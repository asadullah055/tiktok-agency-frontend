import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AskAiPanel from "../components/AskAiPanel";
import DataTable from "../components/ui/DataTable";
import PageTransition from "../components/ui/PageTransition";
import { addConversation, fetchAppointments, fetchConversationHistory, fetchFailedCalls } from "../services/aiService";
import { fetchProfiles } from "../services/profileService";
import { dateTime } from "../utils/formatters";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-blue-100/45 focus:border-electric/60 focus:outline-none";

const AIReceptionistPage = () => {
  const [history, setHistory] = useState([]);
  const [failedCalls, setFailedCalls] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    try {
      const [historyData, failedData, profilesData, appointmentData] = await Promise.all([
        fetchConversationHistory(),
        fetchFailedCalls(),
        fetchProfiles({ limit: 100 }),
        fetchAppointments({ today: true })
      ]);
      setHistory(historyData);
      setFailedCalls(failedData);
      setProfiles(profilesData.data || []);
      setAppointments(appointmentData);
    } catch (error) {
      toast.error(error.message || "Failed to load AI receptionist data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitConversation = handleSubmit(async (values) => {
    try {
      await addConversation(values);
      toast.success("Conversation logged");
      reset();
      load();
    } catch (error) {
      toast.error(error.message || "Could not save conversation");
    }
  });

  const historyColumns = [
    { key: "profile", label: "Profile", render: (row) => row.profile?.name || "-" },
    { key: "outcome", label: "Outcome" },
    { key: "channel", label: "Channel" },
    { key: "transcript", label: "Transcript", render: (row) => <span className="inline-block max-w-lg truncate">{row.transcript}</span> },
    { key: "createdAt", label: "Logged At", render: (row) => dateTime(row.createdAt) }
  ];

  const failedColumns = [
    { key: "profile", label: "Profile", render: (row) => row.profile?.name || "-" },
    { key: "phone", label: "Phone", render: (row) => row.profile?.phone || "-" },
    { key: "transcript", label: "Reason", render: (row) => <span className="inline-block max-w-lg truncate">{row.transcript}</span> },
    { key: "createdAt", label: "Time", render: (row) => dateTime(row.createdAt) }
  ];

  const appointmentColumns = [
    { key: "profile", label: "Profile", render: (row) => row.profile?.name || "-" },
    { key: "phone", label: "Phone", render: (row) => row.profile?.phone || "-" },
    { key: "status", label: "Status" },
    { key: "scheduledFor", label: "Scheduled", render: (row) => dateTime(row.scheduledFor) }
  ];

  return (
    <PageTransition>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <section className="space-y-4">
          <article className="glass rounded-2xl p-4">
            <h3 className="mb-3 font-display text-base font-semibold text-white">Test Conversation</h3>
            <form onSubmit={submitConversation} className="grid gap-3 md:grid-cols-2">
              <select {...register("profile")} className={inputClass}>
                <option value="">Select profile (optional)</option>
                {profiles.map((profile) => (
                  <option key={profile._id} value={profile._id}>
                    {profile.name}
                  </option>
                ))}
              </select>
              <select {...register("outcome")} className={inputClass}>
                <option value="successful">Successful</option>
                <option value="failed">Failed</option>
                <option value="follow_up">Follow Up</option>
              </select>
              <select {...register("channel")} className={inputClass}>
                <option value="call">Call</option>
                <option value="chat">Chat</option>
              </select>
              <input {...register("module")} placeholder="Module (insurance/tiktok/global)" className={inputClass} />
              <textarea
                {...register("transcript", { required: true })}
                placeholder="Conversation transcript"
                className="md:col-span-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-blue-100/45 focus:border-electric/60 focus:outline-none"
                rows={3}
              />
              <button type="submit" className="md:col-span-2 rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white">
                Log Conversation
              </button>
            </form>
          </article>

          <article>
            <DataTable columns={historyColumns} rows={history} emptyMessage="No conversation history yet." />
          </article>
        </section>

        <section className="space-y-4">
          <AskAiPanel />
          <article>
            <h3 className="mb-2 text-sm text-blue-100/70">Appointments (Today)</h3>
            <DataTable columns={appointmentColumns} rows={appointments} emptyMessage="No appointments for today." />
          </article>
          <article>
            <h3 className="mb-2 text-sm text-blue-100/70">Failed Calls</h3>
            <DataTable columns={failedColumns} rows={failedCalls} emptyMessage="No failed calls found." />
          </article>
        </section>
      </div>
    </PageTransition>
  );
};

export default AIReceptionistPage;
