import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { logout } = useAuth();
  const location = useLocation();
  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>Trading Journal</h2>
        <nav>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/trades" className={location.pathname.startsWith('/trades') ? 'active' : ''}>
            Trades
          </Link>
          <Link to="/setups" className={location.pathname === '/setups' ? 'active' : ''}>
            Setups & Tags
          </Link>
          <Link to="/risk" className={location.pathname === '/risk' ? 'active' : ''}>
            Risk Settings
          </Link>
        </nav>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
