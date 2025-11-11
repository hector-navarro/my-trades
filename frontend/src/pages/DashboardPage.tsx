import { useQuery } from '@tanstack/react-query';
import EquityChart from '../components/EquityChart';
import { useApi } from '../hooks/useApi';

interface Overview {
  total_trades: number;
  win_rate: number;
  average_r: number;
  expectancy: number;
  approximate_drawdown: number;
  total_pnl: number;
  best_symbols: string[];
  best_setups: string[];
  equity_curve: number[];
}

interface Deviations {
  total_trades: number;
  early_exit_count: number;
  sl_violation_count: number;
  time_violation_count: number;
}

function DashboardPage() {
  const { request } = useApi();
  const { data: overview } = useQuery<Overview>(['overview'], () => request('/reports/overview'));
  const { data: deviations } = useQuery<Deviations>(['deviations'], () => request('/reports/deviations'));

  return (
    <div className="dashboard">
      <h2>Resumen</h2>
      <div className="metrics">
        <div className="metric-card">
          <span>Total trades</span>
          <strong>{overview?.total_trades ?? 0}</strong>
        </div>
        <div className="metric-card">
          <span>Win rate</span>
          <strong>{((overview?.win_rate ?? 0) * 100).toFixed(1)}%</strong>
        </div>
        <div className="metric-card">
          <span>R medio</span>
          <strong>{overview?.average_r?.toFixed(2) ?? '0.00'}</strong>
        </div>
        <div className="metric-card">
          <span>Expectativa</span>
          <strong>{overview?.expectancy?.toFixed(2) ?? '0.00'}</strong>
        </div>
        <div className="metric-card">
          <span>PnL total</span>
          <strong>{overview?.total_pnl?.toFixed(2) ?? '0.00'}</strong>
        </div>
        <div className="metric-card">
          <span>Drawdown aprox.</span>
          <strong>{overview?.approximate_drawdown?.toFixed(2) ?? '0.00'}</strong>
        </div>
      </div>

      <section>
        <h3>Curva de capital</h3>
        <EquityChart data={overview?.equity_curve ?? []} />
      </section>

      <section className="lists">
        <div>
          <h3>Mejores símbolos</h3>
          <ul>
            {overview?.best_symbols?.map((symbol) => (
              <li key={symbol}>{symbol}</li>
            )) || <li>Sin datos</li>}
          </ul>
        </div>
        <div>
          <h3>Mejores setups</h3>
          <ul>
            {overview?.best_setups?.map((setup) => (
              <li key={setup}>{setup}</li>
            )) || <li>Sin datos</li>}
          </ul>
        </div>
        <div>
          <h3>Desvíos frecuentes</h3>
          <ul>
            <li>Salidas tempranas: {deviations?.early_exit_count ?? 0}</li>
            <li>SL movido en contra: {deviations?.sl_violation_count ?? 0}</li>
            <li>Tiempo excedido: {deviations?.time_violation_count ?? 0}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
