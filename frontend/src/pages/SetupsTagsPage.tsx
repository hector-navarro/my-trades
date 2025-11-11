import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSetup, createTag, deleteSetup, deleteTag, fetchSetups, fetchTags } from '../api/lookups';

export default function SetupsTagsPage() {
  const queryClient = useQueryClient();
  const { data: setups } = useQuery({ queryKey: ['setups'], queryFn: fetchSetups });
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: fetchTags });
  const [setupForm, setSetupForm] = useState({ name: '', description: '' });
  const [tagForm, setTagForm] = useState({ name: '', color: '' });

  const setupMutation = useMutation({
    mutationFn: createSetup,
    onSuccess: () => {
      setSetupForm({ name: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['setups'] });
    }
  });

  const tagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      setTagForm({ name: '', color: '' });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    }
  });

  const handleSetupSubmit = (e: FormEvent) => {
    e.preventDefault();
    setupMutation.mutate({ ...setupForm });
  };

  const handleTagSubmit = (e: FormEvent) => {
    e.preventDefault();
    tagMutation.mutate({ ...tagForm });
  };

  return (
    <div>
      <h1>Setups & Tags</h1>
      <section className="grid">
        <div>
          <h2>Setups</h2>
          <form className="form" onSubmit={handleSetupSubmit}>
            <label>
              Name
              <input value={setupForm.name} onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })} required />
            </label>
            <label>
              Description
              <textarea value={setupForm.description} onChange={(e) => setSetupForm({ ...setupForm, description: e.target.value })} />
            </label>
            <button type="submit" className="primary-btn" disabled={setupMutation.isPending}>
              Add Setup
            </button>
          </form>
          <ul className="list">
            {(setups ?? []).map((setup: any) => (
              <li key={setup.id}>
                <strong>{setup.name}</strong>
                <p>{setup.description}</p>
                <button onClick={() => deleteSetup(setup.id).then(() => queryClient.invalidateQueries({ queryKey: ['setups'] }))}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Tags</h2>
          <form className="form" onSubmit={handleTagSubmit}>
            <label>
              Name
              <input value={tagForm.name} onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })} required />
            </label>
            <label>
              Color
              <input value={tagForm.color} onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })} />
            </label>
            <button type="submit" className="primary-btn" disabled={tagMutation.isPending}>
              Add Tag
            </button>
          </form>
          <ul className="list">
            {(tags ?? []).map((tag: any) => (
              <li key={tag.id}>
                <strong>{tag.name}</strong> {tag.color && <span style={{ color: tag.color }}>{tag.color}</span>}
                <button onClick={() => deleteTag(tag.id).then(() => queryClient.invalidateQueries({ queryKey: ['tags'] }))}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
