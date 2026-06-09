const DB_NAME = 'TrussMeasurements';
const STORE_NAME = 'measurements';
const DB_VERSION = 1;

let db = null;

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
 * @param {Object} dataPoint 
 * @param {string} sessionId 
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
 * @param {Array} dataArray 
 * @param {string} sessionId 
 */
export const saveBulkToIndexedDB = async (dataArray, sessionId = 'default') => {
  if (!dataArray || dataArray.length === 0) return;
  try {
    if (!db) await initIndexedDB();

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      dataArray.forEach(dataPoint => {
        store.add({
          ...dataPoint,
          sessionId,
          timestamp: Date.now(),
          dbTimestamp: new Date().toISOString()
        });
      });
    });
  } catch (error) {
    console.error('Błąd zbiorczego zapisu do IndexedDB:', error);
  }
};

/**
 * @param {string} sessionId
 * @returns {Array} 
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
          const rest = { ...item };
          delete rest.id;
          delete rest.timestamp;
          delete rest.dbTimestamp;
          delete rest.sessionId;
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
 * @param {number} count 
 * @param {string} sessionId
 * @returns {Array} 
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
 * @param {string} sessionId 
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
 * @returns {Array} 
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
          const rest = { ...item };
          delete rest.id;
          delete rest.timestamp;
          delete rest.dbTimestamp;
          delete rest.sessionId;
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
  saveBulkToIndexedDB,
  getAllFromIndexedDB,
  getLastNFromIndexedDB,
  clearSessionFromIndexedDB,
  getAllDataFromIndexedDB
};
