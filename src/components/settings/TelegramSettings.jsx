import { Copy, ExternalLink, Link2, RefreshCw, Unlink2 } from "lucide-react";

const TelegramSettings = ({
  status,
  linkData,
  loading,
  creatorCount = 0,
  onGenerateCode,
  onRefreshStatus,
  onUnlink,
  onCopyCode,
  onCopyDeepLink
}) => {
  const isLinked = Boolean(status?.linked);
  const statusText = isLinked ? "Linked" : status?.status === "pending" ? "Pending Link" : "Not Linked";
  const hasCode = Boolean(linkData?.code);
  const deepLink = linkData?.deepLink || "";

  return (
    <article className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-100">Telegram Integration</h3>
          <p className="mt-1 text-sm text-blue-100/70">Link your Telegram account to manage income and expense from chat.</p>
          <p className="mt-1 text-xs text-blue-100/55">Saved ideal creators: {creatorCount}</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-violet hover:border-electric/55 disabled:opacity-60"
          onClick={onRefreshStatus}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Status
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-slate-100">Status:</span> {statusText}
        </p>

        {isLinked && status?.chatId ? <p className="mt-1 text-xs text-blue-100/75">Chat ID: {status.chatId}</p> : null}
        {isLinked && status?.telegramDisplayName ? (
          <p className="mt-1 text-xs text-blue-100/75">
            Account: {status.telegramDisplayName}
            {status.telegramUsername ? ` (@${status.telegramUsername})` : ""}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={onGenerateCode}
          disabled={loading}
        >
          <Link2 size={16} />
          Generate Link Code
        </button>



        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300 disabled:opacity-60"
          onClick={onUnlink}
          disabled={loading || !isLinked}
        >
          <Unlink2 size={16} />
          Unlink Telegram
        </button>
      </div>

      {hasCode ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-slate-100">Your link code: {linkData.code}</p>
          {linkData.expiresAt ? (
            <p className="mt-1 text-xs text-blue-100/70">Expires at: {new Date(linkData.expiresAt).toLocaleString()}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-blue-100 hover:border-electric/55 disabled:opacity-60"
              onClick={onCopyCode}
              disabled={loading}
            >
              <Copy size={14} />
              Copy Code
            </button>
            {deepLink ? (
              <>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-blue-100 hover:border-electric/55 disabled:opacity-60"
                  onClick={onCopyDeepLink}
                  disabled={loading}
                >
                  <Copy size={14} />
                  Copy Deep Link
                </button>
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-electric hover:underline"
                >
                  Open Telegram
                  <ExternalLink size={13} />
                </a>
              </>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-blue-100/80">
            Send <span className="font-semibold text-slate-100">/start link_{linkData.code}</span> to your Telegram bot.
          </p>
          {!deepLink ? (
            <p className="mt-2 text-xs text-rose-400">
              Deep link unavailable. Set <span className="font-semibold">TELEGRAM_BOT_USERNAME</span> in backend env.
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

export default TelegramSettings;
