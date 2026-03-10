import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageTransition from "../components/ui/PageTransition";
import IdealCreatorModal from "../components/settings/IdealCreatorModal";
import TelegramSettings from "../components/settings/TelegramSettings";
import { addIdealUser, getIdealUsers } from "../services/idealUserService";
import {
  addFixedExpense,
  addIncomeSource,
  fetchFixedExpenses,
  fetchIncomeSources
} from "../services/incomeService";
import {
  generateTelegramLinkCode,
  getTelegramIntegrationStatus,
  unlinkTelegramIntegration
} from "../services/telegramService";

const WORKSPACE_KEY_STORAGE = "crm_workspace_key";

const getOrCreateWorkspaceKey = () => {
  if (typeof window === "undefined") return "default-workspace";

  const existing = window.localStorage.getItem(WORKSPACE_KEY_STORAGE);
  if (existing) return existing;

  const created = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(WORKSPACE_KEY_STORAGE, created);
  return created;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:!text-[#444444] placeholder:opacity-100 focus:border-electric/60 focus:outline-none";

const tabButtonClass = (active) =>
  `rounded-xl px-5 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-gradient-to-r from-electric to-violet text-white"
      : "border border-white/15 bg-white/5 text-blue-100 hover:border-electric/55"
  }`;

const SettingsPage = () => {
  const [workspaceKey] = useState(() => getOrCreateWorkspaceKey());
  const [activeTab, setActiveTab] = useState("income");
  const [sources, setSources] = useState([]);
  const [idealUsers, setIdealUsers] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState({ items: [], monthlyTotal: 0 });
  const [openCreatorModal, setOpenCreatorModal] = useState(false);
  const [creatorSaving, setCreatorSaving] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState({
    status: "unlinked",
    linked: false,
    chatId: null,
    telegramDisplayName: "",
    telegramUsername: "",
    linkCode: "",
    linkCodeExpiresAt: null,
    deepLink: ""
  });
  const [telegramLinkData, setTelegramLinkData] = useState(null);
  const [telegramLoading, setTelegramLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();
  const {
    register: registerFixed,
    handleSubmit: handleSubmitFixed,
    reset: resetFixed
  } = useForm({
    defaultValues: {
      fixedTitle: "",
      fixedAmount: ""
    }
  });

  const loadIncomeSources = async () => {
    try {
      const data = await fetchIncomeSources();
      setSources(data);
    } catch (error) {
      toast.error(error.message || "Failed to load revenue sources");
    }
  };

  const loadIdealUsers = async () => {
    try {
      const users = await getIdealUsers();
      setIdealUsers(users);
    } catch (error) {
      toast.error(error.message || "Failed to load ideal users");
    }
  };

  const loadFixedExpenses = async () => {
    try {
      const data = await fetchFixedExpenses();
      setFixedExpenses(data || { items: [], monthlyTotal: 0 });
    } catch (error) {
      toast.error(error.message || "Failed to load fixed expenses");
    }
  };

  const loadTelegramStatus = async () => {
    setTelegramLoading(true);
    try {
      const data = await getTelegramIntegrationStatus(workspaceKey);
      setTelegramStatus(data);
      setTelegramLinkData(
        data?.linkCode
          ? {
              code: data.linkCode,
              expiresAt: data.linkCodeExpiresAt,
              deepLink: data.deepLink
            }
          : null
      );
    } catch (error) {
      toast.error(error.message || "Failed to load Telegram status");
    } finally {
      setTelegramLoading(false);
    }
  };

  useEffect(() => {
    loadIncomeSources();
    loadIdealUsers();
    loadFixedExpenses();
    loadTelegramStatus();
  }, []);

  const submitIncomeSource = handleSubmit(async (values) => {
    try {
      await addIncomeSource({ name: values.name });
      toast.success("Revenue source saved");
      reset();
      loadIncomeSources();
    } catch (error) {
      toast.error(error.message || "Could not save revenue source");
    }
  });

  const submitFixedExpense = handleSubmitFixed(async (values) => {
    try {
      await addFixedExpense({
        title: values.fixedTitle,
        amount: Number(values.fixedAmount || 0)
      });
      toast.success("Fixed expense saved");
      resetFixed({ fixedTitle: "", fixedAmount: "" });
      await loadFixedExpenses();
    } catch (error) {
      toast.error(error.message || "Could not save fixed expense");
    }
  });

  const submitIdealUser = async (values) => {
    if (creatorSaving) return;

    setCreatorSaving(true);
    try {
      await addIdealUser(values);
      toast.success("Ideal creator saved");
      setOpenCreatorModal(false);
      await loadIdealUsers();
    } catch (error) {
      toast.error(error.message || "Could not save ideal creator");
    } finally {
      setCreatorSaving(false);
    }
  };

  const handleGenerateLinkCode = async () => {
    if (telegramLoading) return;
    setTelegramLoading(true);
    try {
      const data = await generateTelegramLinkCode(workspaceKey);
      setTelegramLinkData({
        code: data.linkCode,
        expiresAt: data.linkCodeExpiresAt,
        deepLink: data.deepLink
      });
      toast.success("Telegram link code generated");
      await loadTelegramStatus();
    } catch (error) {
      toast.error(error.message || "Failed to generate link code");
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    if (telegramLoading) return;
    setTelegramLoading(true);
    try {
      await unlinkTelegramIntegration(workspaceKey);
      setTelegramLinkData(null);
      toast.success("Telegram unlinked");
      await loadTelegramStatus();
    } catch (error) {
      toast.error(error.message || "Failed to unlink Telegram");
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleCopyText = async (text, successMessage) => {
    try {
      if (!text) {
        toast.error("Nothing to copy");
        return;
      }

      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch {
      toast.error("Copy failed");
    }
  };

  const fixedExpenseItems = useMemo(() => fixedExpenses?.items || [], [fixedExpenses]);

  return (
    <PageTransition>
      <section className="space-y-4">
        <article className="glass neon-border rounded-2xl p-5">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={tabButtonClass(activeTab === "income")} onClick={() => setActiveTab("income")}>
              Income
            </button>
            <button type="button" className={tabButtonClass(activeTab === "expense")} onClick={() => setActiveTab("expense")}>
              Expense
            </button>
            <button type="button" className={tabButtonClass(activeTab === "telegram")} onClick={() => setActiveTab("telegram")}>
              Telegram
            </button>
            <button
              type="button"
              onClick={() => setOpenCreatorModal(true)}
              className="rounded-xl bg-gradient-to-r from-electric to-violet px-5 py-2 text-sm font-medium text-white"
            >
              Add Creator
            </button>
          </div>
        </article>

        {activeTab === "income" ? (
          <div className="grid gap-4 xl:grid-cols-3">
            <article className="glass neon-border rounded-2xl p-5 xl:col-span-3">
              <h3 className="font-display text-lg font-semibold text-white">Income Sources</h3>
              <p className="mt-1 text-sm text-blue-100/70">Add revenue types that appear in the Revenue form.</p>

              <form onSubmit={submitIncomeSource} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input {...register("name", { required: true })} placeholder="e.g. Brand Collaboration" className={inputClass} />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white sm:min-w-36"
                >
                  Add Source
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {sources.length ? (
                  sources.map((source) => (
                    <span key={source._id || source.name} className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-sm text-blue-100/90">
                      {source.name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-blue-100/60">No revenue sources yet.</p>
                )}
              </div>
            </article>
          </div>
        ) : null}

        {activeTab === "expense" ? (
          <article className="glass neon-border rounded-2xl p-5">
            <h3 className="font-display text-lg font-semibold text-white">Fixed Expense Settings</h3>
            <p className="mt-1 text-sm text-blue-100/70">Manage monthly fixed expenses used across CRM and Telegram.</p>

            <form onSubmit={submitFixedExpense} className="mt-4 grid gap-3 md:grid-cols-3">
              <input {...registerFixed("fixedTitle", { required: true })} placeholder="Expense title" className={inputClass} />
              <input type="number" min="0" step="0.01" {...registerFixed("fixedAmount", { required: true })} placeholder="Amount" className={inputClass} />
              <button type="submit" className="rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white">
                Save Fixed Expense
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {fixedExpenseItems.length ? (
                fixedExpenseItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-sm text-slate-100">{item.title}</p>
                    <p className="text-sm font-medium text-slate-100">${Number(item.amount || 0).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-blue-100/60">No fixed expense settings found.</p>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-sm text-slate-100">
                Monthly Total: <span className="font-semibold">${Number(fixedExpenses?.monthlyTotal || 0).toFixed(2)}</span>
              </p>
            </div>
          </article>
        ) : null}

        {activeTab === "telegram" ? (
          <TelegramSettings
            status={telegramStatus}
            linkData={telegramLinkData}
            creatorCount={idealUsers.length}
            loading={telegramLoading}
            onGenerateCode={handleGenerateLinkCode}
            onRefreshStatus={loadTelegramStatus}
            onUnlink={handleUnlinkTelegram}
            onCopyCode={() => handleCopyText(telegramLinkData?.code, "Code copied")}
            onCopyDeepLink={() => handleCopyText(telegramLinkData?.deepLink, "Deep link copied")}
          />
        ) : null}
      </section>

      <IdealCreatorModal open={openCreatorModal} onClose={() => setOpenCreatorModal(false)} onSubmit={submitIdealUser} saving={creatorSaving} />
    </PageTransition>
  );
};

export default SettingsPage;
