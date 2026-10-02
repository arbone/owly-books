// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/ui/app.js';

describe('Owly Books UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal() { this.open = true; });
    HTMLDialogElement.prototype.close = vi.fn(function close() { this.open = false; this.dispatchEvent(new Event('close')); });
  });

  it('mostra i libri restituiti dall’adapter', async () => {
    const adapter = {
      searchBySubject: vi.fn().mockResolvedValue([{ id: '/works/1', title: 'Matilde', authors: ['Roald Dahl'], coverId: null }]),
      getCoverUrl: vi.fn().mockReturnValue(''),
      getBookDetails: vi.fn(),
    };
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('fantasy');

    expect(document.querySelector('.book-card h3').textContent).toBe('Matilde');
    expect(document.querySelector('#result-count').textContent).toBe('1 libro');
  });

  it('mostra lo stato vuoto quando non ci sono risultati', async () => {
    const adapter = { searchBySubject: vi.fn().mockResolvedValue([]), getCoverUrl: vi.fn() };
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('categoria-impossibile');

    expect(document.querySelector('#status').textContent).toContain('Nessun libro trovato');
  });

  it('mostra un errore comprensibile quando la richiesta fallisce', async () => {
    const adapter = { searchBySubject: vi.fn().mockRejectedValue(new Error('offline')), getCoverUrl: vi.fn() };
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('fantasy');

    expect(document.querySelector('#status').textContent).toContain('Non riesco a contattare');
  });

  it('mostra il fallback del dettaglio senza descrizione', async () => {
    const adapter = { getBookDetails: vi.fn().mockResolvedValue({ title: 'Libro', description: '', subjects: [] }) };
    const app = createApp(document.querySelector('#app'), adapter);
    await app.showDetails('/works/OL1W');
    expect(document.querySelector('dialog').open).toBe(true);
    expect(document.querySelector('.description').textContent).toContain('non ha ancora una descrizione');
  });

  it('non interpreta il testo della categoria come HTML', async () => {
    const app = createApp(document.querySelector('#app'), { searchBySubject: vi.fn().mockResolvedValue([]) });
    await app.search('<img src=x onerror=alert(1)>');
    expect(document.querySelector('#status img')).toBeNull();
    expect(document.querySelector('#status').textContent).toContain('<img');
  });

  it('ignora il risultato obsoleto se una nuova ricerca termina prima', async () => {
    let resolveFirst;
    const adapter = { searchBySubject: vi.fn().mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; })).mockResolvedValueOnce([]) };
    const app = createApp(document.querySelector('#app'), adapter);
    const first = app.search('old');
    await app.search('new');
    resolveFirst([]);
    await first;
    expect(document.querySelector('#status').textContent).toContain('new');
  });
});
