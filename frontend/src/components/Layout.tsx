import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RiskAlertBanner from './RiskAlertBanner';

function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1>Diario de Trading</h1>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/trades" className={location.pathname.startsWith('/trades') ? 'active' : ''}>
            Operaciones
          </Link>
          <Link to="/trades/new">Nuevo plan</Link>
          <Link to="/setups">Setups y etiquetas</Link>
          <Link to="/risk">Riesgo</Link>
        </nav>
        <div className="user-panel">
          <span>{user?.email}</span>
          <button onClick={logout}>Salir</button>
        </div>
      </aside>
      <main className="main-content">
        <RiskAlertBanner />
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
