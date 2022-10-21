const createDb = () =>
    new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('Rododata', 4);

        request.onupgradeneeded = (event) => {
            const { result: db } = event.target as IDBRequest<IDBDatabase>;
            db.createObjectStore('queries', { autoIncrement: true });
        };

        request.onsuccess = (event) => {
            const { result: db } = event.target as IDBRequest<IDBDatabase>;

            resolve(db);
        };

        request.onerror = (event) =>
            reject(event);
    });

const database = createDb();

export const getStore = async <T>(name: string) => {
    const db = await database;

    const transaction = db.transaction(name, 'readwrite');
    const store = transaction.objectStore(name);

    const commit = () =>
        transaction.commit();

    const get = <T>(id: number) =>
        new Promise<T>((resolve, reject) => {
            const request = store.get(id);

            request.onsuccess = () => {
                const { result } = request;
                resolve(JSON.parse(result));
            };

            request.onerror = (event) => reject(event);
        });

    const list = () =>
        new Promise<{ id: number, value: T }[]>((resolve, reject) => {
            const request = store.getAllKeys();

            request.onsuccess = () => {
                const { result } = request;
                const list = Promise.all(
                    result.map(async id => ({
                        id: id as number,
                        value: await get<T>(id as number)
                    }))
                );

                resolve(list);
            };

            request.onerror = (event) => reject(event);
        });

    const remove = (id: number) =>
        new Promise<void>((resolve, reject) => {
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event);
        });

    const save = (object: T) =>
        new Promise<number>((resolve, reject) => {
            const request = store.add(JSON.stringify(object));

            request.onsuccess = () => resolve(request.result as number);
            request.onerror = (event) => reject(event);
        });

    return { commit, get, list, remove, save };
};
