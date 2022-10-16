import { get, writable } from 'svelte/store';

import type { Dashboard, QueryField } from './Rododata';

function collection<T>(value: T[] = []) {
    const loaded = writable(false);
    const collection = writable<T[]>(value);

    const add = (item: T) => collection
        .update(items => [item, ...items]);
    const remove = (index: number) => collection
        .update(items => items.filter((_, i) => i !== index));

    const set = (value: T[]) => {
        collection.set(value);
        loaded.set(!!value.length);
    };

    return {
        subscribe: collection.subscribe,
        add, remove, set,
        get loaded(): boolean {
            return get(loaded);
        },
        get value(): T[] {
            return get(collection);
        },
    };
}

export const dashboards = collection<Dashboard>();
export const queryableFields = collection<QueryField>();
