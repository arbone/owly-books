# Owly Books

## 1. Il progetto

Una biblioteca digitale per scoprire libri a partire da una categoria. Prototipo didattico JavaScript per il brand immaginario Owly.

Note relatore: Owly supporta l'apprendimento nella scuola primaria. Books esplora una singola esperienza: trovare una lettura. Il catalogo Open Library non è filtrato per età, quindi la selezione resta affidata agli adulti.

## 2. L'esperienza

L'utente cerca una categoria in inglese, consulta fino a 12 opere con titolo e autori, poi apre la descrizione in una finestra di dettaglio.

Note relatore: mostrare una ricerca fantasy. Spiegare che le categorie corrispondono ai soggetti bibliografici di Open Library, non a una ricerca libera per titolo. Le descrizioni restano nella lingua della fonte.

## 3. L'architettura

main.js collega interfaccia e accesso ai dati. La UI gestisce eventi e rendering. OpenLibraryAdapter trasforma la risposta esterna nel modello Book e normalizza i dati mancanti.

Note relatore: il pattern Adapter evita che la UI dipenda da works, key o dalle due forme di description. Il client Fetch è sostituibile nei test. Il proxy locale e le rewrite Vercel inoltrano solo le chiamate per soggetti e opere.

## 4. Stati e accessibilità

Caricamento, nessun risultato ed errore hanno messaggi dedicati. Il dialog si chiude con Escape. Le ricerche precedenti vengono annullate e i risultati obsoleti ignorati.

Note relatore: evidenziare etichetta del campo, area live, fallback per autore e descrizione, riduzione delle animazioni e layout responsive. Non presentare queste scelte come certificazione di conformità.

## 5. Verifica

11 test automatici con Vitest e jsdom. Build Vite completata. GitHub Actions esegue test e build a ogni push e pull request.

Note relatore: mostrare adapter, errori HTTP, rendering, stato vuoto, descrizione mancante, escaping HTML e ordine delle richieste. I test usano risposte simulate per essere ripetibili.

## 6. Codice e pubblicazione

Repository: https://github.com/arbone/owly-books

Deploy: configurazione Vercel pronta. Pubblicazione ancora in attesa del ripristino dell'autenticazione Vercel. Nessun URL demo verificato disponibile.

Note relatore: aprire il link GitHub cliccabile e mostrare README, codice e test. Una volta completato il deploy, aggiornare questa slide e il README con l'URL verificato.
