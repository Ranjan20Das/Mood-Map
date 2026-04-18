import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "moodmap_offline";
const DB_VERSION = 1;
const STORE = "pending_entries";

export interface PendingEntry {
  id: string; // local uuid
  user_id: string;
  mood: number;
  journal: string | null;
  tags: string[];
  voice_url: string | null;
  entry_date: string;
  created_at: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function queueEntry(entry: PendingEntry): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put(STORE, entry);
}

export async function getQueuedEntries(userId: string): Promise<PendingEntry[]> {
  const db = await getDb();
  if (!db) return [];
  const all: PendingEntry[] = await db.getAll(STORE);
  return all.filter((e) => e.user_id === userId);
}

export async function removeQueuedEntry(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(STORE, id);
}

export async function getQueueCount(userId: string): Promise<number> {
  const entries = await getQueuedEntries(userId);
  return entries.length;
}
