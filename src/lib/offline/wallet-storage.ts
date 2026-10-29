import { openDB } from "idb";

const DB_NAME = "eventpass-offline-storage";
const DB_VERSION = 1;

const memoryStore = {
  tickets: [] as any[],
  lastUpdated: null as string | null,
  packs: new Map<string, any>(),
  queue: [] as any[],
};

async function getDB() {
  const hasIndexedDB =
    (typeof globalThis !== "undefined" && typeof globalThis.indexedDB !== "undefined") ||
    (typeof window !== "undefined" && "indexedDB" in window);

  if (!hasIndexedDB) {
    return null;
  }
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("tickets")) {
          db.createObjectStore("tickets", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata");
        }
        if (!db.objectStoreNames.contains("scannerPacks")) {
          db.createObjectStore("scannerPacks", { keyPath: "eventId" });
        }
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", { keyPath: "clientScanId" });
        }
      },
    });
  } catch (e) {
    return null;
  }
}

export async function saveOfflineTickets(tickets: any[]): Promise<void> {
  const updatedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  memoryStore.tickets = [...tickets];
  memoryStore.lastUpdated = updatedTime;

  try {
    const db = await getDB();
    if (!db) {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("eventpass_offline_tickets", JSON.stringify(tickets));
        localStorage.setItem("eventpass_offline_updated", updatedTime);
      }
      return;
    }

    const tx = db.transaction(["tickets", "metadata"], "readwrite");
    const ticketStore = tx.objectStore("tickets");
    await ticketStore.clear();
    for (const t of tickets) {
      await ticketStore.put(t);
    }
    const metaStore = tx.objectStore("metadata");
    await metaStore.put(updatedTime, "lastUpdated");
    await tx.done;
  } catch (e) {
    console.warn("Could not save tickets offline:", e);
  }
}

export async function getOfflineTickets(): Promise<any[]> {
  try {
    const db = await getDB();
    if (!db) {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = localStorage.getItem("eventpass_offline_tickets");
        return raw ? JSON.parse(raw) : memoryStore.tickets;
      }
      return memoryStore.tickets;
    }
    const items = await db.getAll("tickets");
    return items.length > 0 ? items : memoryStore.tickets;
  } catch (e) {
    return memoryStore.tickets;
  }
}

export async function getOfflineLastUpdated(): Promise<string | null> {
  try {
    const db = await getDB();
    if (!db) {
      if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem("eventpass_offline_updated") || memoryStore.lastUpdated;
      }
      return memoryStore.lastUpdated;
    }
    const updated = await db.get("metadata", "lastUpdated");
    return updated || memoryStore.lastUpdated;
  } catch (e) {
    return memoryStore.lastUpdated;
  }
}

export async function saveOfflinePack(eventId: string, pack: any): Promise<void> {
  memoryStore.packs.set(eventId, pack);
  try {
    const db = await getDB();
    if (!db) {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(`eventpass_pack_${eventId}`, JSON.stringify(pack));
      }
      return;
    }
    await db.put("scannerPacks", { eventId, ...pack });
  } catch (e) {
    console.warn("Could not save pack offline:", e);
  }
}

export async function getOfflinePack(eventId: string): Promise<any | null> {
  try {
    const db = await getDB();
    if (!db) {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = localStorage.getItem(`eventpass_pack_${eventId}`);
        return raw ? JSON.parse(raw) : memoryStore.packs.get(eventId) || null;
      }
      return memoryStore.packs.get(eventId) || null;
    }
    const record = await db.get("scannerPacks", eventId);
    return record || memoryStore.packs.get(eventId) || null;
  } catch (e) {
    return memoryStore.packs.get(eventId) || null;
  }
}

export async function saveOfflineQueue(queue: any[]): Promise<void> {
  memoryStore.queue = [...queue];
  try {
    const db = await getDB();
    if (!db) {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("eventpass_sync_queue", JSON.stringify(queue));
      }
      return;
    }
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");
    await store.clear();
    for (const item of queue) {
      await store.put(item);
    }
    await tx.done;
  } catch (e) {
    console.warn("Could not save sync queue offline:", e);
  }
}

export async function getOfflineQueue(): Promise<any[]> {
  try {
    const db = await getDB();
    if (!db) {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = localStorage.getItem("eventpass_sync_queue");
        return raw ? JSON.parse(raw) : memoryStore.queue;
      }
      return memoryStore.queue;
    }
    const items = await db.getAll("syncQueue");
    return items.length > 0 ? items : memoryStore.queue;
  } catch (e) {
    return memoryStore.queue;
  }
}

export async function clearOfflineQueue(): Promise<void> {
  memoryStore.queue = [];
  try {
    const db = await getDB();
    if (!db) {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("eventpass_sync_queue");
      }
      return;
    }
    await db.clear("syncQueue");
  } catch (e) {
    console.warn("Could not clear offline queue:", e);
  }
}

export async function clearAllOfflineData(): Promise<void> {
  memoryStore.tickets = [];
  memoryStore.lastUpdated = null;
  memoryStore.packs.clear();
  memoryStore.queue = [];

  try {
    const db = await getDB();
    if (db) {
      const tx = db.transaction(["tickets", "metadata", "scannerPacks", "syncQueue"], "readwrite");
      await tx.objectStore("tickets").clear();
      await tx.objectStore("metadata").clear();
      await tx.objectStore("scannerPacks").clear();
      await tx.objectStore("syncQueue").clear();
      await tx.done;
    }
  } catch (e) {
    console.warn("Could not clear IndexedDB stores:", e);
  }

  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem("eventpass_offline_tickets");
    localStorage.removeItem("eventpass_offline_updated");
    localStorage.removeItem("eventpass_sync_queue");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("eventpass_pack_")) {
        localStorage.removeItem(key);
      }
    });
  }
}

