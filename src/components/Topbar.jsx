import { Bell, Menu, Search } from "lucide-react";

const Topbar = ({ title, onMenuClick }) => (
  <header className="glass sticky top-0 z-20 mb-6 flex items-center justify-between gap-4 rounded-2xl px-4 py-3">
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="rounded-lg border border-blue-300/20 p-2 text-blue-100 md:hidden"
        onClick={onMenuClick}
      >
        <Menu size={16} />
      </button>
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
    </div>

    <div className="flex items-center gap-3">
      <label className="hidden items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 md:flex">
        <Search size={14} className="text-blue-100/70" />
        <input
          className="w-48 bg-transparent text-sm text-white placeholder:text-blue-100/50 focus:outline-none"
          placeholder="Quick search..."
        />
      </label>
      <button type="button" className="rounded-xl border border-white/10 p-2 text-blue-100 hover:border-blue-300/35">
        <Bell size={16} />
      </button>
    </div>
  </header>
);

export default Topbar;
