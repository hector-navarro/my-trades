import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import TradeFilters from '../components/TradeFilters';
import { useApi } from '../hooks/useApi';

interface Trade {
  id: number;
  symbol: string;
  direction: string;
  status: string;
  planned_entry: number;
  planned_stop_loss: number;
  planned_take_profit: number;
  planned_risk_reward?: number;
  rr_multiple?: number;
  complied_plan?: boolean;
  created_at: string;
}

function TradesPage() {
  const { request } = useApi();
  const [params, setParams] = useState<Record<string, string>>({});

  const queryKey = useMemo(() => ['trades', params], [params]);

  const { data } = useQuery<Trade[]>(queryKey, () => {
    const url = new URL('/trades', 'http://dummy');
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    return request(url.pathname + url.search);
  });

  return (
    <div>
      <div className="page-header">
        <h2>Operaciones</h2>
        <div className="actions">
          <button
            onClick={() => {
              window.location.href = 'http://localhost:8000/trades/export/csv';
            }}
          >
            Exportar CSV
          </button>
          <Link className="primary" to="/trades/new">
            Nuevo plan
          </Link>
        </div>
      </div>
      <TradeFilters onFilter={setParams} />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Símbolo</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th>R/R plan</th>
            <th>R real</th>
            <th>Cumplió plan</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((trade) => (
            <tr key={trade.id}>
              <td>
                <Link to={`/trades/${trade.id}`}>{trade.id}</Link>
              </td>
              <td>{trade.symbol}</td>
              <td>{trade.direction}</td>
              <td>{trade.status}</td>
              <td>{trade.planned_risk_reward?.toFixed(2) ?? '-'}</td>
              <td>{trade.rr_multiple?.toFixed(2) ?? '-'}</td>
              <td>{trade.complied_plan ? 'Sí' : trade.complied_plan === false ? 'No' : '-'}</td>
              <td>{new Date(trade.created_at).toLocaleString()}</td>
            </tr>
          )) || (
            <tr>
              <td colSpan={8}>Sin operaciones.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TradesPage;
