import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';

interface Setup {
  id: number;
  name: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
}

function SetupsPage() {
  const { request } = useApi();
  const queryClient = useQueryClient();
  const { data: setups } = useQuery<Setup[]>(['setups'], () => request('/setups'));
  const { data: tags } = useQuery<Tag[]>(['tags'], () => request('/tags'));

  const [setupName, setSetupName] = useState('');
  const [setupDescription, setSetupDescription] = useState('');
  const [tagName, setTagName] = useState('');

  const setupMutation = useMutation(
    () =>
      request('/setups', {
        method: 'POST',
        body: JSON.stringify({ name: setupName, description: setupDescription })
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['setups'] });
        setSetupName('');
        setSetupDescription('');
      }
    }
  );

  const tagMutation = useMutation(
    () =>
      request('/tags', {
        method: 'POST',
        body: JSON.stringify({ name: tagName })
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags'] });
        setTagName('');
      }
    }
  );

  return (
    <div className="grid">
      <section>
        <h2>Setups</h2>
        <form
          className="form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            setupMutation.mutate();
          }}
        >
          <input value={setupName} onChange={(e) => setSetupName(e.target.value)} placeholder="Nombre" required />
          <textarea
            value={setupDescription}
            onChange={(e) => setSetupDescription(e.target.value)}
            placeholder="Descripción"
            rows={3}
          />
          <button type="submit">Crear setup</button>
        </form>
        <ul>
          {setups?.map((setup) => (
            <li key={setup.id}>
              <strong>{setup.name}</strong>
              <p>{setup.description}</p>
            </li>
          )) || <li>Sin setups</li>}
        </ul>
      </section>
      <section>
        <h2>Etiquetas</h2>
        <form
          className="form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            tagMutation.mutate();
          }}
        >
          <input value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="Nombre de etiqueta" required />
          <button type="submit">Crear etiqueta</button>
        </form>
        <ul className="tags-list">
          {tags?.map((tag) => (
            <li key={tag.id}>{tag.name}</li>
          )) || <li>Sin etiquetas</li>}
        </ul>
      </section>
    </div>
  );
}

export default SetupsPage;
