import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRiskPolicy, upsertRiskPolicy } from '../api/lookups';

export default function RiskSettingsPage() {
  const queryClient = useQueryClient();
  const { data: policy } = useQuery({ queryKey: ['risk-policy'], queryFn: fetchRiskPolicy });
  const [form, setForm] = useState({
    max_risk_per_trade: '',
    max_daily_loss: '',
    max_consecutive_losses: '',
    max_trade_duration_minutes: ''
  });

  useEffect(() => {
    if (policy) {
      setForm({
        max_risk_per_trade: policy.max_risk_per_trade ?? '',
        max_daily_loss: policy.max_daily_loss ?? '',
        max_consecutive_losses: policy.max_consecutive_losses ?? '',
        max_trade_duration_minutes: policy.max_trade_duration_minutes ?? ''
      });
    }
  }, [policy]);

  const mutation = useMutation({
    mutationFn: upsertRiskPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-policy'] });
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      max_risk_per_trade: form.max_risk_per_trade ? Number(form.max_risk_per_trade) : null,
      max_daily_loss: form.max_daily_loss ? Number(form.max_daily_loss) : null,
      max_consecutive_losses: form.max_consecutive_losses ? Number(form.max_consecutive_losses) : null,
      max_trade_duration_minutes: form.max_trade_duration_minutes ? Number(form.max_trade_duration_minutes) : null
    });
  };

  return (
    <div>
      <h1>Risk Settings</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Max risk per trade (price distance)
          <input
            value={form.max_risk_per_trade}
            onChange={(e) => setForm({ ...form, max_risk_per_trade: e.target.value })}
            type="number"
          />
        </label>
        <label>
          Max daily loss
          <input value={form.max_daily_loss} onChange={(e) => setForm({ ...form, max_daily_loss: e.target.value })} type="number" />
        </label>
        <label>
          Max consecutive losses
          <input
            value={form.max_consecutive_losses}
            onChange={(e) => setForm({ ...form, max_consecutive_losses: e.target.value })}
            type="number"
          />
        </label>
        <label>
          Max trade duration (minutes)
          <input
            value={form.max_trade_duration_minutes}
            onChange={(e) => setForm({ ...form, max_trade_duration_minutes: e.target.value })}
            type="number"
          />
        </label>
        <button type="submit" className="primary-btn" disabled={mutation.isPending}>
          Save
        </button>
      </form>
    </div>
  );
}
