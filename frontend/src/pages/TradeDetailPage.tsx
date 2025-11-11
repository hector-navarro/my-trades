import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';

interface Event {
  id: number;
  type: string;
  price?: number;
  quantity?: number;
  note?: string;
  timestamp: string;
}

interface Attachment {
  id: number;
  url: string;
  description?: string;
}

interface TradeDetail {
  id: number;
  symbol: string;
  direction: string;
  status: string;
  planned_entry: number;
  planned_stop_loss: number;
  planned_take_profit: number;
  planned_risk_reward?: number;
  planned_time_limit_minutes?: number;
  planned_reason?: string;
  emotional_state?: string;
  actual_entry_price?: number;
  actual_exit_price?: number;
  pnl?: number;
  rr_multiple?: number;
  complied_plan?: boolean;
  opened_at?: string;
  closed_at?: string;
  created_at: string;
  setup?: { id: number; name: string };
  tags: { id: number; name: string }[];
  attachments: Attachment[];
}

function TradeDetailPage() {
  const { id } = useParams();
  const { request } = useApi();
  const { data: trade } = useQuery<TradeDetail>(['trade', id], () => request(`/trades/${id}`), {
    enabled: Boolean(id)
  });
  const { data: events } = useQuery<Event[]>(['events', id], () => request(`/trades/${id}/events`), {
    enabled: Boolean(id)
  });

  const statusColor = useMemo(() => {
    switch (trade?.status) {
      case 'CLOSED':
        return 'var(--success)';
      case 'OPEN':
        return 'var(--warning)';
      case 'CANCELLED':
        return 'var(--danger)';
      default:
        return 'var(--text-muted)';
    }
  }, [trade?.status]);

  if (!trade) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h2>
        {trade.symbol} #{trade.id}
      </h2>
      <div className="trade-info">
        <div>
          <p>
            Estado: <span style={{ color: statusColor }}>{trade.status}</span>
          </p>
          <p>Dirección: {trade.direction}</p>
          <p>Plan R/R: {trade.planned_risk_reward?.toFixed(2)}</p>
          <p>Resultado R: {trade.rr_multiple?.toFixed(2) ?? '-'}</p>
          <p>PnL: {trade.pnl?.toFixed(2) ?? '-'}</p>
          <p>Cumplió plan: {trade.complied_plan === undefined ? '-' : trade.complied_plan ? 'Sí' : 'No'}</p>
          <p>Tiempo planificado: {trade.planned_time_limit_minutes ? `${trade.planned_time_limit_minutes} min` : '-'}</p>
        </div>
        <div>
          <p>Entrada planificada: {trade.planned_entry}</p>
          <p>Stop loss: {trade.planned_stop_loss}</p>
          <p>Take profit: {trade.planned_take_profit}</p>
          <p>Entrada real: {trade.actual_entry_price ?? '-'}</p>
          <p>Salida real: {trade.actual_exit_price ?? '-'}</p>
        </div>
        <div>
          <p>Setup: {trade.setup?.name ?? '-'}</p>
          <p>Etiquetas: {trade.tags.map((tag) => tag.name).join(', ') || '-'}</p>
          <p>Emoción previa: {trade.emotional_state || '-'}</p>
          <p>Motivo: {trade.planned_reason || '-'}</p>
        </div>
      </div>

      <section>
        <h3>Eventos</h3>
        <ul className="timeline">
          {events?.map((event) => (
            <li key={event.id}>
              <strong>{event.type}</strong> - {event.price ?? '-'} @ {new Date(event.timestamp).toLocaleString()}
              {event.note && <p>{event.note}</p>}
            </li>
          )) || <li>Sin eventos</li>}
        </ul>
      </section>

      <section>
        <h3>Adjuntos</h3>
        <ul>
          {trade.attachments.length ? (
            trade.attachments.map((attachment) => (
              <li key={attachment.id}>
                <a href={attachment.url} target="_blank" rel="noreferrer">
                  {attachment.url}
                </a>
              </li>
            ))
          ) : (
            <li>No hay adjuntos</li>
          )}
        </ul>
      </section>
    </div>
  );
}

export default TradeDetailPage;
