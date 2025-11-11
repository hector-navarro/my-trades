import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';

interface RiskPolicy {
  id: number;
  max_risk_per_trade?: number;
  max_daily_loss?: number;
  max_consecutive_losses?: number;
  max_trade_duration_minutes?: number;
}

function RiskSettingsPage() {
  const { request } = useApi();
  const queryClient = useQueryClient();
  const { data: policy } = useQuery<RiskPolicy>(['risk-policy'], () => request('/risk'));

  const [form, setForm] = useState({
    max_risk_per_trade: policy?.max_risk_per_trade ?? 0,
    max_daily_loss: policy?.max_daily_loss ?? 0,
    max_consecutive_losses: policy?.max_consecutive_losses ?? 0,
    max_trade_duration_minutes: policy?.max_trade_duration_minutes ?? 0
  });

  useEffect(() => {
    if (policy) {
      setForm({
        max_risk_per_trade: policy.max_risk_per_trade ?? 0,
        max_daily_loss: policy.max_daily_loss ?? 0,
        max_consecutive_losses: policy.max_consecutive_losses ?? 0,
        max_trade_duration_minutes: policy.max_trade_duration_minutes ?? 0
      });
    }
  }, [policy]);

  const mutation = useMutation(
    (payload: typeof form) =>
      request('/risk', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['risk-policy'] });
      }
    }
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate(form);
  }

  return (
    <div>
      <h2>Configuración de riesgo</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Riesgo máximo por trade
          <input
            type="number"
            value={form.max_risk_per_trade}
            onChange={(e) => setForm((prev) => ({ ...prev, max_risk_per_trade: Number(e.target.value) }))}
          />
        </label>
        <label>
          Pérdida diaria máxima
          <input
            type="number"
            value={form.max_daily_loss}
            onChange={(e) => setForm((prev) => ({ ...prev, max_daily_loss: Number(e.target.value) }))}
          />
        </label>
        <label>
          Pérdidas consecutivas máximas
          <input
            type="number"
            value={form.max_consecutive_losses}
            onChange={(e) => setForm((prev) => ({ ...prev, max_consecutive_losses: Number(e.target.value) }))}
          />
        </label>
        <label>
          Tiempo máximo por operación (min)
          <input
            type="number"
            value={form.max_trade_duration_minutes}
            onChange={(e) => setForm((prev) => ({ ...prev, max_trade_duration_minutes: Number(e.target.value) }))}
          />
        </label>
        <button type="submit" className="primary">
          Guardar
        </button>
      </form>
    </div>
  );
}

export default RiskSettingsPage;
