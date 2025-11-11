import { useQuery } from '@tanstack/react-query';
import { fetchDeviations, fetchOverview, fetchRiskAlerts } from '../api/trades';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function DashboardPage() {
  const { data: overview } = useQuery({ queryKey: ['overview'], queryFn: fetchOverview });
  const { data: deviations } = useQuery({ queryKey: ['deviations'], queryFn: fetchDeviations });
  const { data: alerts } = useQuery({ queryKey: ['risk-alerts'], queryFn: fetchRiskAlerts });

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <section className="cards">
        <div className="card">
          <h3>Total trades</h3>
          <p>{overview?.total_trades ?? '-'}</p>
        </div>
        <div className="card">
          <h3>Win rate</h3>
          <p>{overview ? `${(overview.win_rate * 100).toFixed(1)}%` : '-'}</p>
        </div>
        <div className="card">
          <h3>Average R</h3>
          <p>{overview?.average_r?.toFixed(2) ?? '-'}</p>
        </div>
        <div className="card">
          <h3>Expectancy</h3>
          <p>{overview?.expectancy?.toFixed(2) ?? '-'}</p>
        </div>
      </section>

      <section className="chart">
        <h2>Equity Curve</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={(overview?.equity_curve || []).map((value: number, index: number) => ({ index, value }))}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="index" tickFormatter={(value) => `#${value + 1}`} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="lists">
        <div>
          <h2>Top Symbols</h2>
          <ul>
            {(overview?.top_symbols ?? []).map((symbol: string) => (
              <li key={symbol}>{symbol}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Top Setups</h2>
          <ul>
            {(overview?.top_setups ?? []).map((setup: string) => (
              <li key={setup}>{setup}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Risk Alerts</h2>
          <ul className="alerts">
            {(alerts ?? []).map((alert: { message: string; level: string }, index: number) => (
              <li key={index} className={alert.level}>
                {alert.message}
              </li>
            ))}
            {alerts?.length === 0 && <li>No active alerts</li>}
          </ul>
        </div>
        <div>
          <h2>Deviation Summary</h2>
          <ul>
            <li>Early exit: {deviations?.early_exit_count ?? 0}</li>
            <li>SL violations: {deviations?.sl_violation_count ?? 0}</li>
            <li>Time violations: {deviations?.time_violation_count ?? 0}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
