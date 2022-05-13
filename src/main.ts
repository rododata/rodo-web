import '@fontsource/roboto';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './global.css';
import App from './App.svelte';

const app = new App({
    target: document.getElementById('app')
});

export default app;
