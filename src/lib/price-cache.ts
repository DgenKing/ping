import type { CryptoPrice } from '@/types';

const DB_NAME = 'ping-cache';
const STORE_NAME = 'prices';
const DB_VERSION = 1;

interface CachedPrices {
  id: string;
  data: CryptoPrice[];
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function cachePrices(prices: CryptoPrice[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const data: CachedPrices = {
      id: 'latest',
      data: prices,
      timestamp: Date.now(),
    };

    store.put(data);
    db.close();
  } catch (error) {
    console.error('Failed to cache prices:', error);
  }
}

export async function getCachedPrices(): Promise<{ data: CryptoPrice[]; timestamp: number } | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.get('latest');
      request.onsuccess = () => {
        db.close();
        const result = request.result as CachedPrices | undefined;
        if (result) {
          resolve({ data: result.data, timestamp: result.timestamp });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}
