import { useEffect, useState } from "react";
import ModalForm from "../ui/ModalForm";

const USD_PER_DIAMOND = 0.005;
const IDEAL_DAY_COUNT = 30;
const inputClass =
  "w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:!text-[#444444] placeholder:opacity-100 focus:border-electric/60 focus:outline-none";

const toPositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const calculateDiamondsFromIncome = (income) => Math.round(toPositiveNumber(income) / USD_PER_DIAMOND);
const calculateIncomeFromDiamonds = (diamonds) => Math.round(toPositiveNumber(diamonds) * USD_PER_DIAMOND);

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey) => {
  const [year, month, day] = String(dateKey || "")
    .split("-")
    .map((value) => Number(value));

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
};

const createInitialState = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    name: "",
    username: "",
    daysCount: "",
    totalIncome: "",
    totalDiamonds: "",
    days: Array.from({ length: IDEAL_DAY_COUNT }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - index);

      return {
        date: formatDateKey(date),
        income: "",
        diamonds: ""
      };
    })
  };
};

const IdealCreatorModal = ({ open, onClose, onSubmit, saving = false }) => {
  const [formState, setFormState] = useState(() => createInitialState());

  useEffect(() => {
    if (!open) return;
    setFormState(createInitialState());
  }, [open]);

  const handleTopIncomeChange = (value) => {
    setFormState((current) => ({
      ...current,
      totalIncome: value,
      totalDiamonds: value === "" ? "" : String(calculateDiamondsFromIncome(value))
    }));
  };

  const handleTopDiamondsChange = (value) => {
    setFormState((current) => ({
      ...current,
      totalDiamonds: value,
      totalIncome: value === "" ? "" : String(calculateIncomeFromDiamonds(value))
    }));
  };

  const handleDayIncomeChange = (rowIndex, value) => {
    setFormState((current) => ({
      ...current,
      days: current.days.map((day, index) =>
        index === rowIndex
          ? {
            ...day,
            income: value,
            diamonds: value === "" ? "" : String(calculateDiamondsFromIncome(value))
          }
          : day
      )
    }));
  };

  const handleDayDiamondsChange = (rowIndex, value) => {
    setFormState((current) => ({
      ...current,
      days: current.days.map((day, index) =>
        index === rowIndex
          ? {
            ...day,
            diamonds: value,
            income: value === "" ? "" : String(calculateIncomeFromDiamonds(value))
          }
          : day
      )
    }));
  };

  const handleDayDateChange = (rowIndex, value) => {
    const selectedDate = parseDateKey(value);
    if (!selectedDate) return;

    setFormState((current) => ({
      ...current,
      days: current.days.map((day, index) => {
        if (index < rowIndex) return day;

        const nextDate = new Date(selectedDate);
        nextDate.setDate(selectedDate.getDate() - (index - rowIndex));

        return {
          ...day,
          date: formatDateKey(nextDate)
        };
      })
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      name: formState.name,
      username: formState.username,
      daysCount: formState.daysCount,
      totalIncome: formState.totalIncome,
      totalDiamonds: formState.totalDiamonds,
      days: formState.days
    });
  };

  return (
    <ModalForm open={open} onClose={onClose} title="Add Creator" panelClassName="max-w-6xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-blue-100/70">Name</label>
            <input
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder="Creator name"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-blue-100/70">Username</label>
            <input
              value={formState.username}
              onChange={(event) => setFormState((current) => ({ ...current, username: event.target.value }))}
              placeholder="@creatorusername"
              className={inputClass}
              required
            />
          </div>



          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-blue-100/70">Total Income (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.totalIncome}
              onChange={(event) => handleTopIncomeChange(event.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-blue-100/70">Total Diamond</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formState.totalDiamonds}
              onChange={(event) => handleTopDiamondsChange(event.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-blue-100/70">Days</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formState.daysCount}
              onChange={(event) => setFormState((current) => ({ ...current, daysCount: event.target.value }))}
              placeholder="30"
              className={inputClass}
            />
          </div>
        </div>

        {/* <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-100/75">
          USD ~= Diamonds x 0.005. Edit either USD or Diamonds and the other field will auto-update with Math.round.
        </div> */}

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-display text-base font-semibold text-white">Last 30 Days</h4>
              <p className="text-sm text-blue-100/65">Dates are pre-filled from today to the previous 29 days.</p>
            </div>
          </div>

          <div className="max-h-[52vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-[minmax(140px,1.2fr)_minmax(120px,1fr)_minmax(120px,1fr)] gap-2 px-1 pb-2 text-xs font-medium uppercase tracking-[0.14em] text-blue-100/60">
              <span>Date</span>
              <span>USD</span>
              <span>Diamonds</span>
            </div>

            <div className="space-y-2">
              {formState.days.map((day, index) => (
                <div key={`${index}-${day.date}`} className="grid grid-cols-[minmax(140px,1.2fr)_minmax(120px,1fr)_minmax(120px,1fr)] gap-2">
                  <div className="rounded-md border border-white/10 bg-white/5  text-sm text-slate-100">
                    <input type="date" value={day.date} onChange={(event) => handleDayDateChange(index, event.target.value)} className={inputClass} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={day.income}
                    onChange={(event) => handleDayIncomeChange(index, event.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={day.diamonds}
                    onChange={(event) => handleDayDiamondsChange(index, event.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-blue-100 hover:border-electric/55"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Creator"}
          </button>
        </div>
      </form>
    </ModalForm>
  );
};

export default IdealCreatorModal;
