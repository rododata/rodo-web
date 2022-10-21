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

    const list = () =>
        new Promise<T[]>((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                const { result } = request;
                const list = result.map(
                    (data: string) => JSON.parse(data) as T
                );

                resolve(list);
            };

            request.onerror = (event) => reject(event);
        });

    const save = (object: T) =>
        new Promise<void>((resolve, reject) => {
            const request = store.add(JSON.stringify(object));

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event);
        });

    return { commit, list, save };
};
