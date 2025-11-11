import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TradesPage from './pages/TradesPage';
import TradeDetailPage from './pages/TradeDetailPage';
import NewTradePage from './pages/NewTradePage';
import SetupsTagsPage from './pages/SetupsTagsPage';
import RiskSettingsPage from './pages/RiskSettingsPage';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="trades" element={<TradesPage />} />
        <Route path="trades/new" element={<NewTradePage />} />
        <Route path="trades/:id" element={<TradeDetailPage />} />
        <Route path="setups" element={<SetupsTagsPage />} />
        <Route path="risk" element={<RiskSettingsPage />} />
      </Route>
    </Routes>
  );
}
