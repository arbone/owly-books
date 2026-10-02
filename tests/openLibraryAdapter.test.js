import { describe, expect, it, vi } from 'vitest';
import { OpenLibraryAdapter, normalizeDescription } from '../src/api/openLibraryAdapter.js';

describe('OpenLibraryAdapter', () => {
  it('gestisce descrizioni assenti e testo semplice', () => {
    expect(normalizeDescription(null)).toBe('');
    expect(normalizeDescription(' Descrizione ')).toBe('Descrizione');
  });

  it('recupera il dettaglio e applica i fallback', async () => {
    const adapter = new OpenLibraryAdapter(vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: 'Libro' }) }));
    expect(await adapter.getBookDetails('/works/OL1W')).toEqual({ id: '/works/OL1W', title: 'Libro', description: '', firstPublishDate: '', subjects: [] });
    await expect(adapter.getBookDetails('../invalid')).rejects.toThrow('Identificativo');
  });
  it('adatta i risultati della Subjects API al modello della UI', async () => {
    const fetchClient = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ works: [{ key: '/works/OL1W', title: 'Il libro', authors: [{ name: 'Ada' }], cover_id: 42 }] }),
    });
    const adapter = new OpenLibraryAdapter(fetchClient);

    const result = await adapter.searchBySubject('Science Fiction');

    expect(fetchClient.mock.calls[0][0]).toContain('/subjects/science_fiction.json?limit=12');
    expect(result).toEqual([{ id: '/works/OL1W', title: 'Il libro', authors: ['Ada'], coverId: 42 }]);
  });

  it('normalizza una descrizione strutturata', () => {
    expect(normalizeDescription({ value: '  Una descrizione. ' })).toBe('Una descrizione.');
  });

  it('segnala una risposta HTTP non valida', async () => {
    const adapter = new OpenLibraryAdapter(vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(adapter.searchBySubject('fantasy')).rejects.toThrow('503');
  });
});
