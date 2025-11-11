import { useQuery } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';

interface RiskAlert {
  triggered: boolean;
  messages: string[];
}

function RiskAlertBanner() {
  const { request } = useApi();
  const { data } = useQuery<RiskAlert>(['risk-alerts'], () => request('/trades/risk/alerts'));

  if (!data || !data.triggered) {
    return null;
  }

  return (
    <div className="alert">
      <strong>Alertas de riesgo:</strong>
      <ul>
        {data.messages.map((msg) => (
          <li key={msg}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default RiskAlertBanner;
