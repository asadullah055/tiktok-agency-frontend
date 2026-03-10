import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import DataTable from "../components/ui/DataTable";
import ModalForm from "../components/ui/ModalForm";
import PageTransition from "../components/ui/PageTransition";
import {
  createAppointment,
  disconnectGoogleCalendar,
  fetchAppointments,
  fetchGoogleCalendarAppointments,
  getGoogleCalendarConnectUrl,
  getGoogleCalendarStatus
} from "../services/aiService";
import { fetchProfiles } from "../services/profileService";
import { dateTime } from "../utils/formatters";

const WORKSPACE_KEY_STORAGE = "crm_workspace_key";
const GOOGLE_CALENDAR_CONNECTION_KEY_STORAGE = "crm_google_calendar_connection_key";

const getOrCreateCalendarConnectionKey = () => {
  if (typeof window === "undefined") return "default-workspace";

  const workspaceKey = window.localStorage.getItem(WORKSPACE_KEY_STORAGE);
  if (workspaceKey) return workspaceKey;

  // Legacy fallback: if calendar was connected before workspace key existed.
  const legacyCalendarKey = window.localStorage.getItem(GOOGLE_CALENDAR_CONNECTION_KEY_STORAGE);
  if (legacyCalendarKey) {
    window.localStorage.setItem(WORKSPACE_KEY_STORAGE, legacyCalendarKey);
    return legacyCalendarKey;
  }

  const created = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(WORKSPACE_KEY_STORAGE, created);
  window.localStorage.setItem(GOOGLE_CALENDAR_CONNECTION_KEY_STORAGE, created);
  return created;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-blue-100/45 focus:border-electric/60 focus:outline-none";

const AppointmentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [connectionKey, setConnectionKey] = useState(() => getOrCreateCalendarConnectionKey());
  const [calendarStatus, setCalendarStatus] = useState({ connected: false, googleAccountEmail: "" });
  const [calendarLoading, setCalendarLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    try {
      const [appointmentsData, profilesData, googleStatus] = await Promise.all([
        fetchAppointments(),
        fetchProfiles({ module: "insurance", limit: 100 }),
        getGoogleCalendarStatus(connectionKey)
      ]);

      setProfiles(profilesData.data || []);
      setCalendarStatus(googleStatus || { connected: false, googleAccountEmail: "" });

      if (googleStatus?.connected) {
        const googleAppointments = await fetchGoogleCalendarAppointments(connectionKey, { bookedOnly: true });
        setAppointments(googleAppointments);
      } else {
        setAppointments(appointmentsData);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load appointments");
    }
  };

  useEffect(() => {
    const callbackConnectionKey = searchParams.get("connectionKey");
    const connectedFlag = searchParams.get("googleCalendarConnected");
    const callbackError = searchParams.get("calendarError");

    if (callbackConnectionKey && callbackConnectionKey !== connectionKey) {
      setConnectionKey(callbackConnectionKey);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(WORKSPACE_KEY_STORAGE, callbackConnectionKey);
        window.localStorage.setItem(GOOGLE_CALENDAR_CONNECTION_KEY_STORAGE, callbackConnectionKey);
      }
    }

    if (connectedFlag === "1") {
      toast.success("Google Calendar connected");
    } else if (connectedFlag === "0") {
      toast.error(callbackError || "Google Calendar connection failed");
    }

    if (connectedFlag || callbackError || callbackConnectionKey) {
      const next = new URLSearchParams(searchParams);
      next.delete("googleCalendarConnected");
      next.delete("calendarError");
      next.delete("connectionKey");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, connectionKey]);

  useEffect(() => {
    load();
  }, [connectionKey]);

  const connectGoogleCalendar = async () => {
    setCalendarLoading(true);
    try {
      const url = await getGoogleCalendarConnectUrl(connectionKey);
      if (!url) throw new Error("Could not generate Google Calendar connection URL");
      window.location.href = url;
    } catch (error) {
      toast.error(error.message || "Google Calendar connection failed");
      setCalendarLoading(false);
    }
  };

  const disconnectCalendar = async () => {
    try {
      await disconnectGoogleCalendar(connectionKey);
      toast.success("Google Calendar disconnected");
      await load();
    } catch (error) {
      toast.error(error.message || "Failed to disconnect Google Calendar");
    }
  };

  const submit = handleSubmit(async (values) => {
    try {
      await createAppointment(values);
      toast.success("Appointment created");
      reset();
      setOpen(false);
      load();
    } catch (error) {
      toast.error(error.message || "Could not create appointment");
    }
  });

  const columns = [
    { key: "profile", label: "Customer", render: (row) => row.profile?.name || "-" },
    { key: "scheduledFor", label: "Scheduled", render: (row) => dateTime(row.scheduledFor) },
    { key: "status", label: "Status" },
    { key: "source", label: "Source" }
  ];

  return (
    <PageTransition>
      <section className="space-y-4">
        <div className="glass flex items-center justify-between rounded-2xl p-4">
          <div>
            <p className="text-sm text-blue-100/75">
              {calendarStatus.connected
                ? "Showing booked appointments from connected Google Calendar account."
                : "Track and schedule incoming appointments from AI receptionist workflows."}
            </p>
            {calendarStatus.connected && calendarStatus.googleAccountEmail ? (
              <p className="mt-1 text-xs text-blue-100/70">Connected account: {calendarStatus.googleAccountEmail}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {calendarStatus.connected ? (
              <button
                type="button"
                onClick={disconnectCalendar}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-blue-100 hover:border-electric/55"
              >
                Disconnect Google Calendar
              </button>
            ) : (
              <button
                type="button"
                disabled={calendarLoading}
                onClick={connectGoogleCalendar}
                className="rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                Connect Google Calendar
              </button>
            )}
            {!calendarStatus.connected ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white"
              >
                New Appointment
              </button>
            ) : null}
          </div>
        </div>
        <DataTable columns={columns} rows={appointments} />
      </section>

      <ModalForm open={open} onClose={() => setOpen(false)} title="Schedule Appointment">
        <form onSubmit={submit} className="space-y-3">
          <select {...register("profile", { required: true })} className={inputClass}>
            <option value="">Select customer profile</option>
            {profiles.map((profile) => (
              <option key={profile._id} value={profile._id}>
                {profile.name}
              </option>
            ))}
          </select>
          <input type="datetime-local" {...register("scheduledFor", { required: true })} className={inputClass} />
          <select {...register("status")} className={inputClass}>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <textarea {...register("notes")} rows={3} placeholder="Notes" className={inputClass} />
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white">
            Save Appointment
          </button>
        </form>
      </ModalForm>
    </PageTransition>
  );
};

export default AppointmentsPage;
