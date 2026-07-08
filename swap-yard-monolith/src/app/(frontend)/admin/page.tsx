import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Listings from "./pages/Listings";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Payouts from "./pages/Payouts";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/payouts" element={<Payouts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
