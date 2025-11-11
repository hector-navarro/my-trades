import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTrades } from '../api/trades';

export default function TradesPage() {
  const { data: trades } = useQuery({ queryKey: ['trades'], queryFn: () => fetchTrades() });

  return (
    <div>
      <header className="page-header">
        <h1>Trades</h1>
        <Link to="/trades/new" className="primary-btn">
          New Trade Plan
        </Link>
      </header>
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Status</th>
            <th>Direction</th>
            <th>Planned R/R</th>
            <th>Result R</th>
            <th>PnL</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(trades ?? []).map((trade: any) => (
            <tr key={trade.id}>
              <td>{trade.symbol}</td>
              <td>{trade.status}</td>
              <td>{trade.direction}</td>
              <td>{trade.planned_risk_reward?.toFixed(2)}</td>
              <td>{trade.r_multiple ? trade.r_multiple.toFixed(2) : '-'}</td>
              <td>{trade.pnl ? trade.pnl.toFixed(2) : '-'}</td>
              <td>
                <Link to={`/trades/${trade.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
