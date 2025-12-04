
import { Link, Routes, Route, Navigate } from "react-router-dom";
import RoutesPage from "./adapters/ui/pages/RoutesPage";
import ComparePage from "./adapters/ui/pages/ComparePage";
import BankingPage from "./adapters/ui/pages/BankingPage";
import PoolingPage from "./adapters/ui/pages/PoolingPage";

export default function App() {
  return (
    <div className="container">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold">FuelEU Compliance Dashboard</h1>
        <nav className="flex gap-4">
          <Link className="text-slate-700 hover:text-blue-600" to="/routes">Routes</Link>
          <Link className="text-slate-700 hover:text-blue-600" to="/compare">Compare</Link>
          <Link className="text-slate-700 hover:text-blue-600" to="/banking">Banking</Link>
          <Link className="text-slate-700 hover:text-blue-600" to="/pooling">Pooling</Link>
        </nav>
      </header>

      <main className="mt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/routes" replace />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/banking" element={<BankingPage />} />
          <Route path="/pooling" element={<PoolingPage />} />
        </Routes>
      </main>
    </div>
  );
}
