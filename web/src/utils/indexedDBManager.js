/**
 * IndexedDB Manager - Persystencja danych pomiarów
 * Przechowuje WSZYSTKIE dane pomiarów, nawet po zamknięciu przeglądarki
 */

const DB_NAME = 'TrussMeasurements';
const STORE_NAME = 'measurements';
const DB_VERSION = 1;

let db = null;

/**
 * Inicjalizuje IndexedDB
 */
export const initIndexedDB = async () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };
  });
};

/**
 * Zapisuje punkt danych do IndexedDB
 * @param {Object} dataPoint - Punkt danych z czasem i wartościami czujników
 * @param {string} sessionId - ID sesji pomiarowej
 */
export const saveToIndexedDB = async (dataPoint, sessionId = 'default') => {
  try {
    if (!db) await initIndexedDB();

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const entry = {
      ...dataPoint,
      sessionId,
      timestamp: Date.now(),
      dbTimestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(entry);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Błąd zapisu do IndexedDB:', error);
  }
};

/**
 * Pobiera wszystkie dane z IndexedDB dla danej sesji
 * @param {string} sessionId - ID sesji
 * @returns {Array} Tablica wszystkich danych
 */
export const getAllFromIndexedDB = async (sessionId = 'default') => {
  try {
    if (!db) await initIndexedDB();

    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(sessionId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result.map(item => {
          const { id, timestamp, dbTimestamp, sessionId, ...rest } = item;
          return rest;
        });
        resolve(data);
      };
    });
  } catch (error) {
    console.error('Błąd odczytu z IndexedDB:', error);
    return [];
  }
};

/**
 * Pobiera ostatnie N punktów danych
 * @param {number} count - Liczba ostatnich punktów
 * @param {string} sessionId - ID sesji
 * @returns {Array} Tablica ostatnich punktów
 */
export const getLastNFromIndexedDB = async (count = 1000, sessionId = 'default') => {
  try {
    const allData = await getAllFromIndexedDB(sessionId);
    return allData.slice(-count);
  } catch (error) {
    console.error('Błąd pobierania ostatnich danych:', error);
    return [];
  }
};

/**
 * Czyszczenie danych dla sesji
 * @param {string} sessionId - ID sesji
 */
export const clearSessionFromIndexedDB = async (sessionId = 'default') => {
  try {
    if (!db) await initIndexedDB();

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(sessionId));
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  } catch (error) {
    console.error('Błąd czyszczenia sesji:', error);
  }
};

/**
 * Pobiera całą bazę danych (dla debugowania)
 * @returns {Array} Wszystkie dane w bazie
 */
export const getAllDataFromIndexedDB = async () => {
  try {
    if (!db) await initIndexedDB();

    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result.map(item => {
          const { id, timestamp, dbTimestamp, sessionId, ...rest } = item;
          return rest;
        });
        resolve(data);
      };
    });
  } catch (error) {
    console.error('Błąd pobierania wszystkich danych:', error);
    return [];
  }
};

export default {
  initIndexedDB,
  saveToIndexedDB,
  getAllFromIndexedDB,
  getLastNFromIndexedDB,
  clearSessionFromIndexedDB,
  getAllDataFromIndexedDB
};
