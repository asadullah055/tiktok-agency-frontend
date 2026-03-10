import { Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppSidebar from "../components/AppSidebar";
import Topbar from "../components/Topbar";
import useUiStore from "../store/useUiStore";

const titleMap = {
  "/": "Global Analytics Dashboard",
  "/insurance": "Insurance CRM Overview",
  "/insurance/customers": "Insurance Customers",
  "/insurance/appointments": "Appointments",
  "/insurance/ai-receptionist": "AI Receptionist",
  "/tiktok": "TikTok Agency Overview",
  "/tiktok/creators": "Partner Management",
  "/tiktok/daily-data": "Creators",
  "/tiktok/messages": "Partner Conversations",
  "/tiktok/income": "Company Revenew",
  "/settings": "Workspace Settings"
};

const AppLayout = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUiStore();
  const pageTitle = useMemo(() => titleMap[location.pathname] || "Enterprise CRM", [location.pathname]);

  return (
    <div className="relative flex h-screen gap-4 overflow-hidden p-4">
      <div className="hidden shrink-0 md:sticky md:top-4 md:block md:h-[calc(100vh-2rem)]">
        <AppSidebar />
      </div>

      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="fixed inset-0 z-40 bg-black/65 p-4 md:hidden"
          >
            <div className="h-full w-[290px]">
              <AppSidebar onNavigate={closeSidebar} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="min-w-0 flex-1 overflow-y-auto pr-1">
        <Topbar title={pageTitle} onMenuClick={toggleSidebar} />
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
