const DB_NAME = "AvantgardeVideoDb";
const STORE_NAME = "Videos";
const DB_VERSION = 1;

function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => {
      console.error("IndexedDB open error:", request.error);
      reject(request.error);
    };
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export function saveVideoBlob(blob: Blob): Promise<void> {
  return initDb().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, "heroVideo");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log("Successfully saved video to IndexedDB");
        resolve();
      };
    });
  });
}

export function getVideoBlob(): Promise<Blob | null> {
  return initDb().then((db) => {
    return new Promise<Blob | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("heroVideo");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result instanceof Blob ? result : null);
      };
    });
  });
}

export function clearVideoBlob(): Promise<void> {
  return initDb().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete("heroVideo");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log("Successfully cleared custom video from IndexedDB");
        resolve();
      };
    });
  });
}
