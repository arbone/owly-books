import './styles.css';
import { OpenLibraryAdapter } from './api/openLibraryAdapter.js';
import { createApp } from './ui/app.js';

const adapter = new OpenLibraryAdapter();

createApp(document.querySelector('#app'), adapter);
