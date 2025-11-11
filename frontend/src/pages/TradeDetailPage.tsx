import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addEvent, fetchTrade } from '../api/trades';

export default function TradeDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { data: trade } = useQuery({ queryKey: ['trade', id], queryFn: () => fetchTrade(id), enabled: Boolean(id) });
  const [eventForm, setEventForm] = useState({ type: 'NOTE', price: '', quantity: '', note: '' });
  const mutation = useMutation({
    mutationFn: (payload: any) => addEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade', id] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate({
      type: eventForm.type,
      price: eventForm.price ? Number(eventForm.price) : undefined,
      quantity: eventForm.quantity ? Number(eventForm.quantity) : undefined,
      note: eventForm.note || undefined
    });
    setEventForm({ type: 'NOTE', price: '', quantity: '', note: '' });
  };

  if (!trade) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Trade Detail</h1>
      <section className="grid">
        <div>
          <h2>Plan</h2>
          <ul>
            <li>Symbol: {trade.symbol}</li>
            <li>Direction: {trade.direction}</li>
            <li>Entry: {trade.planned_entry}</li>
            <li>Stop Loss: {trade.planned_sl}</li>
            <li>Take Profit: {trade.planned_tp}</li>
            <li>Planned R/R: {trade.planned_risk_reward}</li>
            <li>Time limit: {trade.planned_time_limit_minutes} min</li>
            <li>Reason: {trade.planned_reason}</li>
            <li>Emotion: {trade.planned_emotion}</li>
            <li>Tags: {trade.planned_tags}</li>
          </ul>
        </div>
        <div>
          <h2>Result</h2>
          <ul>
            <li>Status: {trade.status}</li>
            <li>Entry price: {trade.actual_entry_price ?? '-'}</li>
            <li>Exit price: {trade.actual_exit_price ?? '-'}</li>
            <li>PnL: {trade.pnl ?? '-'}</li>
            <li>R multiple: {trade.r_multiple ? trade.r_multiple.toFixed(2) : '-'}</li>
            <li>Complied with plan: {trade.complied_with_plan === null ? '-' : trade.complied_with_plan ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>Timeline</h2>
        <ul className="timeline">
          {(trade.events ?? []).map((event: any) => (
            <li key={event.id}>
              <strong>{event.type}</strong> – {event.occurred_at}
              {event.price && <span> @ {event.price}</span>}
              {event.note && <p>{event.note}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Add Event</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Type
              <select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}>
                <option value="ENTRY">ENTRY</option>
                <option value="ADD">ADD</option>
                <option value="REDUCE">REDUCE</option>
                <option value="MOVE_SL">MOVE_SL</option>
                <option value="MOVE_TP">MOVE_TP</option>
                <option value="EXIT">EXIT</option>
                <option value="NOTE">NOTE</option>
              </select>
            </label>
            <label>
              Price
              <input value={eventForm.price} onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })} />
            </label>
            <label>
              Quantity
              <input value={eventForm.quantity} onChange={(e) => setEventForm({ ...eventForm, quantity: e.target.value })} />
            </label>
          </div>
          <label>
            Note
            <textarea value={eventForm.note} onChange={(e) => setEventForm({ ...eventForm, note: e.target.value })} />
          </label>
          <button type="submit" className="primary-btn" disabled={mutation.isPending}>
            Add Event
          </button>
        </form>
      </section>
    </div>
  );
}
