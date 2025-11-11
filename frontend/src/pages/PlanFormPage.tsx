import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';

interface Setup {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

function PlanFormPage() {
  const { request } = useApi();
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [entry, setEntry] = useState(0);
  const [sl, setSl] = useState(0);
  const [tp, setTp] = useState(0);
  const [timeLimit, setTimeLimit] = useState(60);
  const [reason, setReason] = useState('');
  const [emotion, setEmotion] = useState('');
  const [setupId, setSetupId] = useState<number | ''>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [attachments, setAttachments] = useState<string[]>(['']);
  const [error, setError] = useState('');

  const { data: setups } = useQuery<Setup[]>(['setups'], () => request('/setups'));
  const { data: tags } = useQuery<Tag[]>(['tags'], () => request('/tags'));

  const rr = useMemo(() => {
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    return risk ? (reward / risk).toFixed(2) : '0.00';
  }, [entry, sl, tp]);

  useEffect(() => {
    if (direction === 'LONG' && sl >= entry) {
      setSl(entry - 1);
    }
    if (direction === 'LONG' && tp <= entry) {
      setTp(entry + 1);
    }
    if (direction === 'SHORT' && sl <= entry) {
      setSl(entry + 1);
    }
    if (direction === 'SHORT' && tp >= entry) {
      setTp(entry - 1);
    }
  }, [direction]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const body = {
        symbol,
        direction,
        planned_entry: entry,
        planned_stop_loss: sl,
        planned_take_profit: tp,
        planned_time_limit_minutes: timeLimit,
        planned_reason: reason,
        emotional_state: emotion,
        setup_id: setupId || null,
        tag_ids: selectedTags,
        attachments: attachments
          .filter((url) => url)
          .map((url) => ({ url }))
      };
      await request('/trades', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      navigate('/trades');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h2>Nuevo plan de operación</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Símbolo
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
          </label>
          <label>
            Dirección
            <select value={direction} onChange={(e) => setDirection(e.target.value as 'LONG' | 'SHORT')}>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
          </label>
          <label>
            Entrada
            <input type="number" value={entry} onChange={(e) => setEntry(Number(e.target.value))} required />
          </label>
          <label>
            Stop Loss
            <input type="number" value={sl} onChange={(e) => setSl(Number(e.target.value))} required />
          </label>
          <label>
            Take Profit
            <input type="number" value={tp} onChange={(e) => setTp(Number(e.target.value))} required />
          </label>
          <label>
            Tiempo máximo (min)
            <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
          </label>
          <label>
            Setup
            <select value={setupId} onChange={(e) => setSetupId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Sin setup</option>
              {setups?.map((setup) => (
                <option key={setup.id} value={setup.id}>
                  {setup.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Estado emocional
            <input value={emotion} onChange={(e) => setEmotion(e.target.value)} />
          </label>
        </div>
        <label>
          Motivo / Setup
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        </label>
        <fieldset>
          <legend>Etiquetas</legend>
          <div className="tags">
            {tags?.map((tag) => (
              <label key={tag.id}>
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTags((prev) => [...prev, tag.id]);
                    } else {
                      setSelectedTags((prev) => prev.filter((id) => id !== tag.id));
                    }
                  }}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>
        <section>
          <h3>Adjuntos</h3>
          {attachments.map((url, index) => (
            <div key={index} className="attachment-row">
              <input
                value={url}
                onChange={(e) => {
                  const copy = [...attachments];
                  copy[index] = e.target.value;
                  setAttachments(copy);
                }}
                placeholder="URL de captura"
              />
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAttachments((prev) => [...prev, ''])}
          >
            Añadir URL
          </button>
        </section>
        <p>Riesgo/Beneficio estimado: <strong>{rr}</strong></p>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary">
          Guardar plan
        </button>
      </form>
    </div>
  );
}

export default PlanFormPage;
