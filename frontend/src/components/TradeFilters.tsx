import { useState } from 'react';

interface TradeFiltersProps {
  onFilter: (params: Record<string, string>) => void;
}

function TradeFilters({ onFilter }: TradeFiltersProps) {
  const [symbol, setSymbol] = useState('');
  const [status, setStatus] = useState('');
  const [direction, setDirection] = useState('');

  return (
    <form
      className="filters"
      onSubmit={(event) => {
        event.preventDefault();
        const params: Record<string, string> = {};
        if (symbol) params.symbol = symbol;
        if (status) params.state = status;
        if (direction) params.direction = direction;
        onFilter(params);
      }}
    >
      <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Símbolo" />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Estado</option>
        <option value="PLANNED">Planificado</option>
        <option value="OPEN">Abierto</option>
        <option value="CLOSED">Cerrado</option>
        <option value="CANCELLED">Cancelado</option>
      </select>
      <select value={direction} onChange={(e) => setDirection(e.target.value)}>
        <option value="">Dirección</option>
        <option value="LONG">Long</option>
        <option value="SHORT">Short</option>
      </select>
      <button type="submit">Filtrar</button>
    </form>
  );
}

export default TradeFilters;
