const API_BASE_URL = '/open-library';

function normalizeDescription(description) {
  if (typeof description === 'string') return description.trim();
  if (description && typeof description.value === 'string') return description.value.trim();
  return '';
}

function toNonNegativeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export class OpenLibraryAdapter {
  constructor(fetchClient = (...args) => fetch(...args)) {
    this.fetchClient = fetchClient;
  }

  async request(path, signal) {
    const response = await this.fetchClient(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Open Library ha risposto con stato ${response.status}`);
    }

    return response.json();
  }

  async searchBySubject(subject, { limit = 12, offset = 0, signal } = {}) {
    const normalizedSubject = subject.trim().toLowerCase().replace(/\s+/g, '_');
    const safeLimit = Math.min(Math.max(toNonNegativeInteger(limit, 12), 1), 50);
    const safeOffset = toNonNegativeInteger(offset, 0);
    const data = await this.request(
      `/subjects/${encodeURIComponent(normalizedSubject)}.json?limit=${safeLimit}&offset=${safeOffset}`,
      signal,
    );

    const books = (data.works ?? []).map((work) => ({
      id: work.key,
      title: work.title || 'Titolo non disponibile',
      authors: (work.authors ?? []).map((author) => author.name).filter(Boolean),
      coverId: work.cover_id ?? null,
    }));

    const parsedTotal = Number(data.work_count);

    return {
      books,
      total: Number.isFinite(parsedTotal) ? parsedTotal : null,
    };
  }

  async getBookDetails(workId, { signal } = {}) {
    if (!/^(\/works\/)?OL\d+W$/.test(workId)) throw new Error('Identificativo opera non valido');
    const safeId = workId.startsWith('/works/') ? workId : `/works/${workId}`;
    const work = await this.request(`${safeId}.json`, signal);

    return {
      id: safeId,
      title: work.title || 'Titolo non disponibile',
      description: normalizeDescription(work.description),
      firstPublishDate: work.first_publish_date ?? '',
      subjects: (work.subjects ?? []).slice(0, 5),
    };
  }

  getCoverUrl(coverId, size = 'M') {
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
      : '';
  }
}

export { normalizeDescription };
