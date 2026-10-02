# Owly Books

Owly Books è una web app didattica che permette di cercare libri per categoria usando i dati pubblici di Open Library. Il progetto nasce come estensione del brand immaginario Owly, una piattaforma SaaS dedicata alla scuola primaria.

## Demo e repository

- **Demo Vercel:** da inserire dopo il deploy
- **Repository GitHub:** da inserire dopo la pubblicazione

## Funzionalità

- ricerca dei libri per categoria;
- elenco con titolo, autori e copertina;
- dettaglio dell’opera con descrizione, data e argomenti;
- stati di caricamento, errore e nessun risultato;
- interfaccia responsive e accessibile da tastiera;
- annullamento delle richieste precedenti quando parte una nuova ricerca.

## Architettura

Il progetto separa accesso ai dati e interfaccia:

```text
src/
├── api/
│   └── openLibraryAdapter.js  # Adapter tra Open Library e il modello dell'app
├── ui/
│   └── app.js                 # Rendering e interazioni
├── main.js                    # Composition root
└── styles.css                 # Design system e layout responsive
```

L'`OpenLibraryAdapter` nasconde i dettagli delle API esterne e restituisce oggetti semplici e coerenti alla UI. In questo modo l'interfaccia non dipende dalla struttura originale delle risposte di Open Library e l'accesso ai dati può essere sostituito o simulato nei test.

## Tecnologie

- JavaScript ES6+ con moduli;
- Vite;
- Vitest e jsdom;
- Fetch API;
- Open Library Subjects API e Works API;
- Vercel.

## Avvio locale

Richiede Node.js 20 o successivo.

```bash
npm install
npm run dev
```

Apri l'indirizzo indicato da Vite nel terminale.

## Test e build

```bash
npm test
npm run build
```

I test verificano la trasformazione dei dati dell'Adapter, la gestione degli errori e i principali stati della UI.

## API utilizzate

- Ricerca per soggetto: `https://openlibrary.org/subjects/{subject}.json`
- Dettaglio opera: `https://openlibrary.org/works/{workId}.json`
- Copertine: `https://covers.openlibrary.org/b/id/{coverId}-M.jpg`

Open Library può non fornire descrizione, autore o copertina per alcuni record. La UI gestisce questi casi con testi e immagini sostitutive.

## Deploy su Vercel

Il progetto usa la configurazione standard di Vite:

- build command: `npm run build`;
- output directory: `dist`;
- install command: `npm install`.

## Licenza

Progetto realizzato a scopo didattico. I metadati bibliografici provengono da [Open Library](https://openlibrary.org/).
