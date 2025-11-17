import { openDB } from 'idb';

const DB_NAME = 'chemical-discovery-db';
const DB_VERSION = 1;
const DISCOVERY_STORE = 'discovery-runs';

// Initialize database
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create discovery runs store if it doesn't exist
      if (!db.objectStoreNames.contains(DISCOVERY_STORE)) {
        const store = db.createObjectStore(DISCOVERY_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    },
  });
}

// Discovery Run Functions
export async function saveDiscoveryRun(runData) {
  const db = await getDB();
  const tx = db.transaction(DISCOVERY_STORE, 'readwrite');
  const store = tx.objectStore(DISCOVERY_STORE);
  
  await store.add(runData);
  await tx.done;
}

export async function getAllDiscoveryRuns() {
  const db = await getDB();
  const tx = db.transaction(DISCOVERY_STORE, 'readonly');
  const store = tx.objectStore(DISCOVERY_STORE);
  
  return store.getAll();
}

export async function getDiscoveryRun(id) {
  const db = await getDB();
  const tx = db.transaction(DISCOVERY_STORE, 'readonly');
  const store = tx.objectStore(DISCOVERY_STORE);
  
  return store.get(id);
}

export async function deleteDiscoveryRun(id) {
  const db = await getDB();
  const tx = db.transaction(DISCOVERY_STORE, 'readwrite');
  const store = tx.objectStore(DISCOVERY_STORE);
  
  await store.delete(id);
  await tx.done;
}

export async function clearAllDiscoveryRuns() {
  const db = await getDB();
  const tx = db.transaction(DISCOVERY_STORE, 'readwrite');
  const store = tx.objectStore(DISCOVERY_STORE);
  
  await store.clear();
  await tx.done;
}

// Auth token management (for offline support)
export async function saveAuthToken(token, userName) {
  sessionStorage.setItem('authToken', token);
  sessionStorage.setItem('userName', userName);
}

export async function deleteAuthToken() {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userName');
}

export async function getAuthToken() {
  return sessionStorage.getItem('authToken');
}
