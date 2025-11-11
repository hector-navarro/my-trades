import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTrade } from '../api/trades';
import { fetchSetups, fetchTags } from '../api/lookups';
import { useNavigate } from 'react-router-dom';

export default function NewTradePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: setups } = useQuery({ queryKey: ['setups'], queryFn: fetchSetups });
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: fetchTags });
  const [form, setForm] = useState({
    symbol: '',
    direction: 'LONG',
    planned_entry: 0,
    planned_sl: 0,
    planned_tp: 0,
    planned_time_limit_minutes: 60,
    planned_reason: '',
    planned_emotion: '',
    planned_tags: '',
    quantity: 1,
    setup_id: ''
  });
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const mutation = useMutation({
    mutationFn: createTrade,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      navigate(`/trades/${data.id}`);
    }
  });

  const plannedRR = useMemo(() => {
    const risk = Math.abs(form.planned_entry - form.planned_sl);
    const reward = Math.abs(form.planned_tp - form.planned_entry);
    if (!risk) return 0;
    return reward / risk;
  }, [form]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      planned_entry: Number(form.planned_entry),
      planned_sl: Number(form.planned_sl),
      planned_tp: Number(form.planned_tp),
      planned_time_limit_minutes: Number(form.planned_time_limit_minutes),
      quantity: Number(form.quantity),
      setup_id: form.setup_id ? Number(form.setup_id) : undefined,
      direction: form.direction as 'LONG' | 'SHORT',
      tag_ids: selectedTags
    });
  };

  return (
    <div>
      <h1>Plan a Trade</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Symbol
            <input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} required />
          </label>
          <label>
            Direction
            <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
          </label>
          <label>
            Entry
            <input
              type="number"
              value={form.planned_entry}
              onChange={(e) => setForm({ ...form, planned_entry: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Stop Loss
            <input
              type="number"
              value={form.planned_sl}
              onChange={(e) => setForm({ ...form, planned_sl: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Take Profit
            <input
              type="number"
              value={form.planned_tp}
              onChange={(e) => setForm({ ...form, planned_tp: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Quantity
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </label>
          <label>
            Time limit (minutes)
            <input
              type="number"
              value={form.planned_time_limit_minutes}
              onChange={(e) => setForm({ ...form, planned_time_limit_minutes: Number(e.target.value) })}
            />
          </label>
          <label>
            Setup
            <select value={form.setup_id} onChange={(e) => setForm({ ...form, setup_id: e.target.value })}>
              <option value="">None</option>
              {(setups ?? []).map((setup: any) => (
                <option key={setup.id} value={setup.id}>
                  {setup.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Reason/setup notes
          <textarea value={form.planned_reason} onChange={(e) => setForm({ ...form, planned_reason: e.target.value })} />
        </label>
        <label>
          Emotion
          <input value={form.planned_emotion} onChange={(e) => setForm({ ...form, planned_emotion: e.target.value })} />
        </label>
        <label>
          Tags (comma separated)
          <input value={form.planned_tags} onChange={(e) => setForm({ ...form, planned_tags: e.target.value })} />
        </label>
        <fieldset>
          <legend>Select reusable tags</legend>
          <div className="checkbox-list">
            {(tags ?? []).map((tag: any) => (
              <label key={tag.id}>
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedTags([...selectedTags, tag.id]);
                    else setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                  }}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="summary">
          <strong>Planned R/R: {plannedRR.toFixed(2)}</strong>
          {form.direction === 'LONG' && !(form.planned_sl < form.planned_entry && form.planned_entry < form.planned_tp) && (
            <p className="error">For long trades SL must be below entry and TP above entry.</p>
          )}
          {form.direction === 'SHORT' && !(form.planned_tp < form.planned_entry && form.planned_entry < form.planned_sl) && (
            <p className="error">For short trades TP must be below entry and SL above entry.</p>
          )}
        </div>
        <button className="primary-btn" type="submit" disabled={mutation.isPending}>
          Save Plan
        </button>
      </form>
    </div>
  );
}
