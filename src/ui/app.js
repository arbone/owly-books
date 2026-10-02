const POPULAR_SUBJECTS = ['fantasy', 'adventure', 'animals', 'science'];

function escapeHtml(value = '') {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML.replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function bookCard(book, adapter) {
  const authors = book.authors.length ? book.authors.join(', ') : 'Autore non disponibile';
  const coverUrl = adapter.getCoverUrl(book.coverId);
  const cover = coverUrl
    ? `<img src="${coverUrl}" alt="Copertina di ${escapeHtml(book.title)}" loading="lazy" />`
    : `<div class="cover-placeholder" aria-hidden="true"><span>OWLY</span></div>`;

  return `
    <article class="book-card">
      <div class="book-cover">${cover}</div>
      <div class="book-copy">
        <h3>${escapeHtml(book.title)}</h3>
        <p>${escapeHtml(authors)}</p>
        <button class="text-button" data-book-id="${escapeHtml(book.id)}" type="button">
          Scopri di più <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  `;
}

export function createApp(root, adapter) {
  let activeSearchController;
  let activeDetailController;

  root.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#" aria-label="Owly Books, homepage">
        <span class="brand-mark" aria-hidden="true">O</span>
        <span>Owly Books</span>
      </a>
      <span class="eyebrow">Leggere apre mondi</span>
    </header>

    <main id="main-content">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="kicker">La biblioteca digitale di Owly</p>
          <h1 id="hero-title">Una nuova storia inizia da una curiosità</h1>
          <p class="intro">Cerca una categoria e trova libri da esplorare insieme, a scuola o a casa.</p>
          <form class="search-form" role="search">
            <label class="sr-only" for="subject">Categoria di libri</label>
            <input id="subject" name="subject" type="search" placeholder="Es. fantasy, animals, science…" autocomplete="off" required />
            <button type="submit">Cerca libri</button>
          </form>
          <div class="suggestions" aria-label="Categorie suggerite">
            <span>Prova:</span>
            ${POPULAR_SUBJECTS.map((subject) => `<button type="button" data-subject="${subject}">${subject}</button>`).join('')}
          </div>
          <p class="search-help">Usa categorie in inglese. I testi provengono dal catalogo aperto di Open Library e non sono filtrati per età.</p>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="moon"></div>
          <div class="owl">
            <span class="eye left"></span><span class="eye right"></span><span class="beak"></span>
          </div>
          <div class="book-shape"><span></span></div>
          <span class="star star-one">✦</span><span class="star star-two">✦</span>
        </div>
      </section>

      <section class="results-section" aria-labelledby="results-title">
        <div class="section-heading">
          <div>
            <p class="kicker">Scaffale consigliato</p>
            <h2 id="results-title">Inizia da una categoria</h2>
          </div>
          <p id="result-count" aria-live="polite"></p>
        </div>
        <div id="status" class="status-panel" role="status" aria-live="polite">
          <span class="status-icon" aria-hidden="true">⌁</span>
          <p>Scrivi un argomento o scegli uno dei suggerimenti.</p>
        </div>
        <div id="books" class="books-grid" hidden></div>
      </section>
    </main>

    <footer><p>Un progetto didattico Owly · Dati forniti da Open Library</p></footer>

    <dialog id="book-dialog" aria-labelledby="dialog-title">
      <button class="dialog-close" type="button" aria-label="Chiudi dettaglio">×</button>
      <div id="dialog-content"></div>
    </dialog>
  `;

  const form = root.querySelector('.search-form');
  const input = root.querySelector('#subject');
  const booksContainer = root.querySelector('#books');
  const status = root.querySelector('#status');
  const resultCount = root.querySelector('#result-count');
  const title = root.querySelector('#results-title');
  const dialog = root.querySelector('#book-dialog');
  const dialogContent = root.querySelector('#dialog-content');

  function setStatus(kind, message) {
    booksContainer.hidden = true;
    status.hidden = false;
    status.className = `status-panel ${kind}`;
    status.innerHTML = kind === 'loading'
      ? `<span class="loader" aria-hidden="true"></span><p>${escapeHtml(message)}</p>`
      : `<span class="status-icon" aria-hidden="true">${kind === 'error' ? '!' : '⌁'}</span><p>${escapeHtml(message)}</p>`;
  }

  async function search(subject) {
    const query = subject.trim();
    if (!query) return;

    activeSearchController?.abort();
    activeSearchController = new AbortController();
    const controller = activeSearchController;
    setStatus('loading', `Cerco libri su “${query}”…`);
    resultCount.textContent = '';
    title.textContent = `Libri su “${query}”`;

    try {
      const books = await adapter.searchBySubject(query, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!books.length) {
        setStatus('empty', `Nessun libro trovato per “${query}”. Prova una categoria più ampia.`);
        return;
      }
      status.hidden = true;
      booksContainer.hidden = false;
      booksContainer.innerHTML = books.map((book) => bookCard(book, adapter)).join('');
      resultCount.textContent = `${books.length} ${books.length === 1 ? 'libro' : 'libri'}`;
    } catch (error) {
      if (error.name !== 'AbortError' && !controller.signal.aborted) {
        setStatus('error', 'Non riesco a contattare la biblioteca. Controlla la connessione e riprova.');
      }
    }
  }

  async function showDetails(workId, button) {
    activeDetailController?.abort();
    activeDetailController = new AbortController();
    const controller = activeDetailController;
    dialogContent.innerHTML = `<div class="dialog-loading"><span class="loader" aria-hidden="true"></span><h2 id="dialog-title">Carico i dettagli…</h2></div>`;
    dialog.showModal();
    dialog.addEventListener('close', () => button?.focus(), { once: true });

    try {
      const details = await adapter.getBookDetails(workId, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const description = details.description || 'Open Library non ha ancora una descrizione per questo titolo.';
      dialogContent.innerHTML = `
        <p class="kicker">Dettaglio del libro</p>
        <h2 id="dialog-title">${escapeHtml(details.title)}</h2>
        ${details.firstPublishDate ? `<p class="publication">Prima pubblicazione: ${escapeHtml(details.firstPublishDate)}</p>` : ''}
        <p class="description">${escapeHtml(description)}</p>
        ${details.subjects.length ? `<div class="tags">${details.subjects.map((subject) => `<span>${escapeHtml(subject)}</span>`).join('')}</div>` : ''}
      `;
    } catch (error) {
      if (error.name !== 'AbortError' && !controller.signal.aborted) {
        dialogContent.innerHTML = `<h2 id="dialog-title">Dettaglio non disponibile</h2><p class="description">Non riesco a caricare questo libro. Chiudi la finestra e riprova.</p>`;
      }
    }

  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search(input.value);
  });

  root.querySelector('.suggestions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-subject]');
    if (!button) return;
    input.value = button.dataset.subject;
    search(button.dataset.subject);
  });

  booksContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-book-id]');
    if (button) showDetails(button.dataset.bookId, button);
  });

  root.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => activeDetailController?.abort());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  return { search, showDetails };
}
