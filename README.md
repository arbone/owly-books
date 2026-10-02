# Owly Books

Owly Books è una web app didattica che permette di cercare libri per categoria usando i dati pubblici di Open Library. Il progetto nasce come estensione del brand immaginario Owly, una piattaforma SaaS dedicata alla scuola primaria.

## Demo e repository

- **Repository GitHub:** [arbone/owly-books](https://github.com/arbone/owly-books)
- **Demo Vercel:** [owly-books.vercel.app](https://owly-books.vercel.app)
- **Presentazione:** [PDF di 6 slide](outputs/Progetto%20JavaScript%20Advanced%20di%20Arbi%20Shehu.pdf) e [testi con note relatore](outputs/Presentazione-Owly-Books.md).

## Funzionalità

- ricerca dei libri per categoria;
- elenco con titolo, autori e copertina;
- dettaglio dell’opera con descrizione, data e argomenti;
- stati di caricamento, errore e nessun risultato;
- interfaccia responsive e accessibile da tastiera;
- caricamento progressivo dei risultati con paginazione `limit`/`offset` e pulsante “Mostra altri”;
- deduplica dei risultati tra pagine successive;
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

Richiede Node.js 22.12+ (consigliato Node 22 LTS), oppure 20.19+.

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

La suite include 15 casi: adattamento dei risultati, descrizioni testuali/strutturate/assenti, dettaglio e identificativi, errore HTTP, rendering, risultati vuoti, errore di rete, fallback del dettaglio, escaping HTML, risultati obsoleti, paginazione, append dei risultati, deduplica e fine catalogo. GitHub Actions esegue test e build a ogni push e pull request. I test simulano la rete, quindi non richiedono la disponibilità del servizio esterno.

## API utilizzate

- Ricerca per soggetto: `https://openlibrary.org/subjects/{subject}.json`
- Dettaglio opera: `https://openlibrary.org/works/{workId}.json`
- Copertine: `https://covers.openlibrary.org/b/id/{coverId}-M.jpg`

Open Library può non fornire descrizione, autore o copertina per alcuni record. La UI gestisce questi casi con testi e immagini sostitutive.

Le richieste JSON passano da `/open-library`: Vite le inoltra durante lo sviluppo e Vercel applica le rewrite dichiarate in `vercel.json`. Non servono chiavi API. Le copertine arrivano direttamente dal servizio Covers. Per una verifica completa locale usa `npm run dev`; `npm run preview` serve la build statica e non riproduce le rewrite di Vercel.

### Limiti del catalogo

La ricerca riguarda soggetti bibliografici, non titoli o autori. Usa categorie in inglese come `fantasy`, `animals`, `science` o `science fiction`. Carica 12 risultati alla volta e consente di continuare a esplorare la categoria con “Mostra altri”, usando `limit` e `offset` fino all’esaurimento dei risultati disponibili. Le descrizioni mantengono la lingua originale e non vengono tradotte. Il catalogo non è filtrato per età: questo prototipo non sostituisce la selezione dei contenuti da parte di insegnanti o genitori.

La UI usa un dialog nativo, etichetta del campo, area live per gli stati, collegamento per saltare ai risultati e preferenza di riduzione del movimento. Queste scelte non costituiscono una certificazione di accessibilità.

## Deploy su Vercel

Il progetto usa la configurazione standard di Vite:

- build command: `npm run build`;
- output directory: `dist`;
- install command: `npm install`.

Il progetto Vercel è collegato al repository `arbone/owly-books`: i push su `main` aggiornano la produzione. Per un deploy manuale esegui `vercel login` e `vercel --prod` dalla cartella del progetto. Non commettere token o la directory `.vercel`.

## Licenza

Progetto realizzato a scopo didattico. I metadati bibliografici provengono da [Open Library](https://openlibrary.org/).
