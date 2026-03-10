import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageTransition from "../components/ui/PageTransition";
import DataTable from "../components/ui/DataTable";
import StatCard from "../components/ui/StatCard";
import ModalForm from "../components/ui/ModalForm";
import { addIncomeRecord, fetchFixedExpenses, fetchIncomeRecords } from "../services/incomeService";
import { fetchCreators } from "../services/tiktokService";
import { currency, dateOnly } from "../utils/formatters";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-blue-100/45 focus:border-electric/60 focus:outline-none";

const todayValue = () => new Date().toISOString().slice(0, 10);

const IncomePage = () => {
  const [partners, setPartners] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [variableExpenses, setVariableExpenses] = useState([]);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      amount: "",
      date: todayValue()
    }
  });

  const load = async () => {
    try {
      const [partnerRows, fixedData, variableRows] = await Promise.all([
        fetchCreators(),
        fetchFixedExpenses(),
        fetchIncomeRecords({ type: "expense", expenseMode: "variable" })
      ]);

      setPartners(partnerRows);
      setFixedExpenses(fixedData?.items || []);
      setVariableExpenses(variableRows);
    } catch (error) {
      toast.error(error.message || "Failed to load revenew data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const incomeRows = useMemo(() => {
    const rows = partners
      .map((partner) => ({
        id: partner._id,
        partner: partner.tiktokData?.creatorName || partner.name || "-",
        amount: Number(partner.tiktokData?.partnerRevenue || 0),
        date: partner.tiktokData?.partnerRevenueDate
      }))
      .filter((row) => row.amount > 0 || row.date)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return rows;
  }, [partners]);

  const fixedRows = useMemo(
    () =>
      fixedExpenses.map((item, index) => ({
        id: item.key || index,
        title: item.title,
        amount: Number(item.amount || 0)
      })),
    [fixedExpenses]
  );

  const totals = useMemo(() => {
    const totalIncome = incomeRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const fixedExpense = fixedRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const variableExpense = variableExpenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const totalExpense = fixedExpense + variableExpense;

    return {
      totalIncome,
      fixedExpense,
      variableExpense,
      totalExpense,
      netRevenew: totalIncome - totalExpense
    };
  }, [fixedRows, incomeRows, variableExpenses]);

  const submitVariableExpense = handleSubmit(async (values) => {
    try {
      await addIncomeRecord({
        type: "expense",
        expenseMode: "variable",
        title: values.title,
        amount: Number(values.amount || 0),
        date: values.date
      });
      toast.success("Variable expense added");
      setOpen(false);
      reset({ title: "", amount: "", date: todayValue() });
      load();
    } catch (error) {
      toast.error(error.message || "Could not save variable expense");
    }
  });

  const incomeColumns = [
    { key: "partner", label: "Partner" },
    { key: "amount", label: "Income", render: (row) => currency(row.amount) },
    { key: "date", label: "Date", render: (row) => dateOnly(row.date) }
  ];

  const fixedColumns = [
    { key: "title", label: "Fixed Expense" },
    { key: "amount", label: "Amount", render: (row) => currency(row.amount) }
  ];

  const variableColumns = [
    { key: "title", label: "Variable Expense", render: (row) => row.title || row.incomeType || "-" },
    { key: "amount", label: "Amount", render: (row) => currency(Number(row.amount || 0)) },
    { key: "date", label: "Date", render: (row) => dateOnly(row.date) }
  ];

  return (
    <PageTransition>
      <div className="space-y-4">
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Income" value={currency(totals.totalIncome)} />
          <StatCard label="Total Expense" value={currency(totals.totalExpense)} />
          <StatCard label="Net Revenew" value={currency(totals.netRevenew)} color="violet" />
        </section>

        <section className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-white">Income (From Partners)</h3>
            <p className="text-sm text-blue-100/70">Income is the amount received from partners.</p>
          </div>
          <DataTable columns={incomeColumns} rows={incomeRows} emptyMessage="No partner income data yet." />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-white">Fixed Expense (Monthly)</h3>
              <p className="text-sm text-blue-100/70">{currency(totals.fixedExpense)}</p>
            </div>
            <DataTable columns={fixedColumns} rows={fixedRows} emptyMessage="No fixed expense configured." />
          </article>

          <article className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-white">Variable Expense</h3>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl bg-gradient-to-r from-electric to-violet px-3 py-2 text-xs text-white"
              >
                Add Variable Expense
              </button>
            </div>
            <p className="mb-3 text-sm text-blue-100/70">Add manual variable expenses here.</p>
            <DataTable columns={variableColumns} rows={variableExpenses} emptyMessage="No variable expense added." />
          </article>
        </section>
      </div>

      <ModalForm open={open} onClose={() => setOpen(false)} title="Add Variable Expense">
        <form onSubmit={submitVariableExpense} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-blue-100/85">Expense Title</label>
            <input {...register("title", { required: true })} placeholder="e.g. Boost Campaign" className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-blue-100/85">Amount</label>
            <input type="number" min="0.01" step="0.01" {...register("amount", { required: true })} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-blue-100/85">Date</label>
            <input type="date" {...register("date", { required: true })} className={inputClass} />
          </div>

          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white">
            Save Variable Expense
          </button>
        </form>
      </ModalForm>
    </PageTransition>
  );
};

export default IncomePage;
