import clsx from "clsx";
import { Activity, BarChart3, CalendarClock, DollarSign, LayoutDashboard, MessageCircle, Settings, Shield, UserCircle2, Users, WandSparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const navGroups = [
  {
    heading: "Core",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
      { label: "Settings", path: "/settings", icon: Settings }
    ]
  },
  {
    heading: "Insurance CRM",
    items: [
      { label: "Insurance CRM", path: "/insurance", icon: Shield },
      { label: "Customers", path: "/insurance/customers", icon: Users },
      { label: "Appointments", path: "/insurance/appointments", icon: CalendarClock },
      { label: "AI Receptionist", path: "/insurance/ai-receptionist", icon: WandSparkles }
    ]
  },
  {
    heading: "TikTok Agency",
    items: [
      { label: "TikTok Agency", path: "/tiktok", icon: BarChart3 },
      { label: "Partners", path: "/tiktok/creators", icon: UserCircle2 },
      { label: "New Creators", path: "/tiktok/daily-data", icon: Activity },
      { label: "Conversations", path: "/tiktok/messages", icon: MessageCircle },
      { label: "Revenew", path: "/tiktok/income", icon: DollarSign }
    ]
  }
];

const linkClass = ({ isActive }) =>
  clsx(
    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-300",
    isActive
      ? "border border-electric/40 bg-gradient-to-r from-electric/20 to-violet/20 text-ink shadow-[0_12px_26px_rgba(79,124,255,0.24)]"
      : "border border-transparent text-slate-300 hover:border-violet/40 hover:bg-violet/20 hover:text-ink"
  );

const AppSidebar = ({ onNavigate }) => (
  <aside className="glass flex h-full w-[290px] flex-col rounded-2xl p-4">
    <div className="mb-8 mt-1">
      <h1 className="font-display text-xl font-bold tracking-tight text-white">NovaCRM Enterprise</h1>
      <p className="mt-1 text-xs text-blue-100/70">Insurance + Partner Operations Cloud</p>
    </div>

    <div className="space-y-6 overflow-y-auto pr-1">
      {navGroups.map((group) => (
        <section key={group.heading}>
          <p className="mb-2 px-2 text-[11px] uppercase tracking-[0.14em] text-blue-200/50">{group.heading}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} end className={linkClass} onClick={onNavigate}>
                  <Icon size={16} className="text-electric transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  </aside>
);

export default AppSidebar;
