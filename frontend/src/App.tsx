import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TradesPage from './pages/TradesPage';
import TradeDetailPage from './pages/TradeDetailPage';
import PlanFormPage from './pages/PlanFormPage';
import SetupsPage from './pages/SetupsPage';
import RiskSettingsPage from './pages/RiskSettingsPage';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
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
        <Route path="trades/new" element={<PlanFormPage />} />
        <Route path="trades/:id" element={<TradeDetailPage />} />
        <Route path="setups" element={<SetupsPage />} />
        <Route path="risk" element={<RiskSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
