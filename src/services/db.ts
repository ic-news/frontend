import { openDB } from "idb";

const DB_NAME = "ic-news-db";
const DB_VERSION = 1;

// Store names
export const STORES = {
  TOKENS: "tokens",
  CRYPTO_MARKET: "crypto_market",
  METADATA: "metadata",
  TOP_LISTINGS: "top_listings",
} as const;

// Cache database connection
let dbInstance: any = null;

export const initDB = async () => {
  const startTime = performance.now();

  try {
    // If connection exists, return it directly
    if (dbInstance) {
      const endTime = performance.now();
      console.log(`DB already open, took ${endTime - startTime}ms`);
      return dbInstance;
    }

    // Open new connection
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.TOKENS)) {
          db.createObjectStore(STORES.TOKENS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.CRYPTO_MARKET)) {
          db.createObjectStore(STORES.CRYPTO_MARKET, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: "id" });
        }
      },
    });

    const endTime = performance.now();
    console.log(`DB opened in ${endTime - startTime}ms`);

    return dbInstance;
  } catch (error) {
    const endTime = performance.now();
    console.error(`DB open failed after ${endTime - startTime}ms:`, error);
    throw error;
  }
};

// Token related functions
export const saveTokens = async (tokens: any[]) => {
  const db = await initDB();
  const tx = db.transaction(STORES.TOKENS, "readwrite");
  const store = tx.objectStore(STORES.TOKENS);

  await store.clear();
  for (const token of tokens) {
    await store.put({ ...token, id: token.symbol });
  }

  await updateLastFetchTime(STORES.TOKENS);
  await tx.done;
};

export const getTokens = async () => {
  const db = await initDB();
  const tx = db.transaction(STORES.TOKENS, "readonly");
  const store = tx.objectStore(STORES.TOKENS);
  const tokens = await store.getAll();
  return tokens;
};

// Crypto market related functions
export const saveCryptoMarketData = async (data: any[], category: string = "top") => {
  const db = await initDB();
  const tx = db.transaction(STORES.CRYPTO_MARKET, "readwrite");
  const store = tx.objectStore(STORES.CRYPTO_MARKET);

  // Save with a compound ID to distinguish different categories
  await store.put({
    id: `${category}_listings`,
    data,
    timestamp: Date.now(),
  });

  await updateLastFetchTime(STORES.CRYPTO_MARKET);
  await tx.done;
};

export const getCryptoMarketData = async (category: string = "top") => {
  const db = await initDB();
  const tx = db.transaction(STORES.CRYPTO_MARKET, "readonly");
  const store = tx.objectStore(STORES.CRYPTO_MARKET);

  const result = await store.get(`${category}_listings`);
  return result?.data || [];
};

// Metadata functions for tracking last update times
const updateLastFetchTime = async (storeId: string) => {
  const db = await initDB();
  const tx = db.transaction(STORES.METADATA, "readwrite");
  const store = tx.objectStore(STORES.METADATA);

  await store.put({
    id: `${storeId}_lastUpdate`,
    timestamp: Date.now(),
  });

  await tx.done;
};

export const getLastFetchTime = async (storeId: string) => {
  const db = await initDB();
  const tx = db.transaction(STORES.METADATA, "readonly");
  const store = tx.objectStore(STORES.METADATA);

  const result = await store.get(`${storeId}_lastUpdate`);
  return result?.timestamp || 0;
};
