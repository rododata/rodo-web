import { writable } from 'svelte/store';

import type { Dashboard } from './Rododata';

export const dashboards = writable<Dashboard[]>([]);
