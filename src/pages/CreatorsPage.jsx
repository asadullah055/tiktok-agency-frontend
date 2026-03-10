import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageTransition from "../components/ui/PageTransition";
import DataTable from "../components/ui/DataTable";
import ModalForm from "../components/ui/ModalForm";
import { fetchCreators, saveCreator } from "../services/tiktokService";
import { dateOnly } from "../utils/formatters";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-blue-100/45 focus:border-electric/60 focus:outline-none";

const CreatorsPage = () => {
  const [creators, setCreators] = useState([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    try {
      const data = await fetchCreators();
      setCreators(data);
    } catch (error) {
      toast.error(error.message || "Could not load partners");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = handleSubmit(async (values) => {
    try {
      const username = String(values.tiktokUsername || "").trim();
      await saveCreator({
        creatorName: username,
        name: username,
        tiktokUsername: username,
        email: values.email,
        partnerRevenue: Number(values.partnerRevenue || 0),
        partnerRevenueDate: values.partnerRevenueDate
      });
      toast.success("Partner saved");
      reset();
      setOpen(false);
      load();
    } catch (error) {
      toast.error(error.message || "Failed to save partner");
    }
  });

  const columns = [
    { key: "username", label: "Username", render: (row) => row.tiktokData?.tiktokUsername || "-" },
    { key: "email", label: "Email", render: (row) => row.email || "-" },
    { key: "partnerRevenue", label: "Revenew", render: (row) => Number(row.tiktokData?.partnerRevenue || 0).toFixed(2) },
    { key: "partnerRevenueDate", label: "Date", render: (row) => dateOnly(row.tiktokData?.partnerRevenueDate) }
  ];

  return (
    <PageTransition>
      <section className="space-y-4">
        <div className="glass flex items-center justify-between rounded-2xl p-4">
          <p className="text-sm text-blue-100/70">Manage partner records with shared profile continuity across modules.</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white"
          >
            Add Partner
          </button>
        </div>
        <DataTable columns={columns} rows={creators} />
      </section>

      <ModalForm open={open} onClose={() => setOpen(false)} title="Add TikTok Partner">
        <form onSubmit={submit} className="space-y-3">
          <input {...register("tiktokUsername", { required: true })} placeholder="Username" className={inputClass} />
          <input type="email" {...register("email", { required: true })} placeholder="Email" className={inputClass} />
          <input type="number" min="0" step="0.01" {...register("partnerRevenue")} placeholder="Partner Revenew Received" className={inputClass} />
          <input type="date" {...register("partnerRevenueDate")} className={inputClass} />
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white">
            Save Partner
          </button>
        </form>
      </ModalForm>
    </PageTransition>
  );
};

export default CreatorsPage;
