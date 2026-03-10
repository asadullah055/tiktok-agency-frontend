import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import InsuranceOverviewPage from "./pages/InsuranceOverviewPage";
import InsuranceCustomersPage from "./pages/InsuranceCustomersPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import AIReceptionistPage from "./pages/AIReceptionistPage";
import TikTokOverviewPage from "./pages/TikTokOverviewPage";
import CreatorsPage from "./pages/CreatorsPage";
import DailyDataPage from "./pages/DailyDataPage";
import MessagesPage from "./pages/MessagesPage";
import IncomePage from "./pages/IncomePage";
import SettingsPage from "./pages/SettingsPage";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/insurance" element={<InsuranceOverviewPage />} />
          <Route path="/insurance/customers" element={<InsuranceCustomersPage />} />
          <Route path="/insurance/appointments" element={<AppointmentsPage />} />
          <Route path="/insurance/ai-receptionist" element={<AIReceptionistPage />} />
          <Route path="/tiktok" element={<TikTokOverviewPage />} />
          <Route path="/tiktok/creators" element={<CreatorsPage />} />
          <Route path="/tiktok/daily-data" element={<DailyDataPage />} />
          <Route path="/tiktok/messages" element={<MessagesPage />} />
          <Route path="/tiktok/income" element={<IncomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
