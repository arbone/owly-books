// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/ui/app.js';

const makeBook = (id, title = `Libro ${id}`) => ({
  id: `/works/OL${id}W`,
  title,
  authors: ['Autore'],
  coverId: null,
});

function makeAdapter(overrides = {}) {
  return {
    searchBySubject: vi.fn().mockResolvedValue({ books: [], total: 0 }),
    getCoverUrl: vi.fn().mockReturnValue(''),
    getBookDetails: vi.fn(),
    ...overrides,
  };
}

describe('Owly Books UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal() { this.open = true; });
    HTMLDialogElement.prototype.close = vi.fn(function close() {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    });
  });

  it('mostra i libri restituiti dall’adapter', async () => {
    const adapter = makeAdapter({
      searchBySubject: vi.fn().mockResolvedValue({
        books: [{ id: '/works/OL1W', title: 'Matilde', authors: ['Roald Dahl'], coverId: null }],
        total: 1,
      }),
    });
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('fantasy');

    expect(document.querySelector('.book-card h3').textContent).toBe('Matilde');
    expect(document.querySelector('#result-count').textContent).toBe('1 di 1 libro');
  });

  it('mostra lo stato vuoto quando non ci sono risultati', async () => {
    const adapter = makeAdapter();
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('categoria-impossibile');

    expect(document.querySelector('#status').textContent).toContain('Nessun libro trovato');
  });

  it('mostra un errore comprensibile quando la richiesta fallisce', async () => {
    const adapter = makeAdapter({
      searchBySubject: vi.fn().mockRejectedValue(new Error('offline')),
    });
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('fantasy');

    expect(document.querySelector('#status').textContent).toContain('Non riesco a contattare');
  });

  it('mostra il fallback del dettaglio senza descrizione', async () => {
    const adapter = makeAdapter({
      getBookDetails: vi.fn().mockResolvedValue({
        title: 'Libro',
        description: '',
        subjects: [],
      }),
    });
    const app = createApp(document.querySelector('#app'), adapter);

    await app.showDetails('/works/OL1W');

    expect(document.querySelector('dialog').open).toBe(true);
    expect(document.querySelector('.description').textContent).toContain('non ha ancora una descrizione');
  });

  it('non interpreta il testo della categoria come HTML', async () => {
    const adapter = makeAdapter();
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('<img src=x onerror=alert(1)>');

    expect(document.querySelector('#status img')).toBeNull();
    expect(document.querySelector('#status').textContent).toContain('<img');
  });

  it('ignora il risultato obsoleto se una nuova ricerca termina prima', async () => {
    let resolveFirst;
    const adapter = makeAdapter({
      searchBySubject: vi.fn()
        .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
        .mockResolvedValueOnce({ books: [], total: 0 }),
    });
    const app = createApp(document.querySelector('#app'), adapter);

    const first = app.search('old');
    await app.search('new');
    resolveFirst({ books: [makeBook(1)], total: 1 });
    await first;

    expect(document.querySelector('#status').textContent).toContain('new');
    expect(document.querySelectorAll('.book-card')).toHaveLength(0);
  });

  it('carica altre pagine usando offset e mantiene i risultati già visibili', async () => {
    const firstPage = Array.from({ length: 12 }, (_, index) => makeBook(index + 1));
    const adapter = makeAdapter({
      searchBySubject: vi.fn()
        .mockResolvedValueOnce({ books: firstPage, total: 13 })
        .mockResolvedValueOnce({ books: [makeBook(13)], total: 13 }),
    });
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('fantasy');
    expect(document.querySelector('#pagination').hidden).toBe(false);

    await app.loadMore();

    expect(adapter.searchBySubject.mock.calls[1][1]).toMatchObject({ limit: 12, offset: 12 });
    expect(document.querySelectorAll('.book-card')).toHaveLength(13);
    expect(document.querySelector('#result-count').textContent).toBe('13 di 13 libri');
    expect(document.querySelector('#pagination').hidden).toBe(true);
  });

  it('non duplica lo stesso libro tra pagine consecutive', async () => {
    const firstPage = Array.from({ length: 12 }, (_, index) => makeBook(index + 1));
    const adapter = makeAdapter({
      searchBySubject: vi.fn()
        .mockResolvedValueOnce({ books: firstPage, total: 13 })
        .mockResolvedValueOnce({ books: [makeBook(12), makeBook(13)], total: 13 }),
    });
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('fantasy');
    await app.loadMore();

    expect(document.querySelectorAll('.book-card')).toHaveLength(13);
    expect(document.querySelectorAll('[data-book-id="/works/OL12W"]')).toHaveLength(1);
  });

  it('nasconde Mostra altri quando Open Library restituisce una pagina vuota', async () => {
    const firstPage = Array.from({ length: 12 }, (_, index) => makeBook(index + 1));
    const adapter = makeAdapter({
      searchBySubject: vi.fn()
        .mockResolvedValueOnce({ books: firstPage, total: null })
        .mockResolvedValueOnce({ books: [], total: null }),
    });
    const app = createApp(document.querySelector('#app'), adapter);

    await app.search('fantasy');
    await app.loadMore();

    expect(document.querySelector('#pagination').hidden).toBe(true);
    expect(document.querySelectorAll('.book-card')).toHaveLength(12);
  });
});
