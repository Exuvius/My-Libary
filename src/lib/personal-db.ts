import type { PersonalCollection, PersonalDocument, PersonalDictEntry } from "@/types/personal";

const DB_NAME = "handien-personal";
const DB_VERSION = 3;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        const docStore = db.createObjectStore("documents", { keyPath: "id" });
        docStore.createIndex("createdAt", "createdAt");
        docStore.createIndex("collectionId", "collectionId");
      }

      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains("collections")) {
          const colStore = db.createObjectStore("collections", { keyPath: "id" });
          colStore.createIndex("createdAt", "createdAt");
        }
        if (oldVersion === 1) {
          const tx = request.transaction!;
          const docStore = tx.objectStore("documents");
          if (!docStore.indexNames.contains("collectionId")) {
            docStore.createIndex("collectionId", "collectionId");
          }
        }
      }

      if (oldVersion < 3) {
        const dictStore = db.createObjectStore("dict-entries", { keyPath: "id" });
        dictStore.createIndex("createdAt", "createdAt");
        dictStore.createIndex("text", "text", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

// ─── Collections ───

export async function addCollection(col: PersonalCollection): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("collections", "readwrite");
  await req(tx.objectStore("collections").add(col));
  db.close();
}

export async function getCollection(id: string): Promise<PersonalCollection | undefined> {
  const db = await openDB();
  const result = await req(
    db.transaction("collections", "readonly").objectStore("collections").get(id)
  );
  db.close();
  return result as PersonalCollection | undefined;
}

export async function getAllCollections(): Promise<PersonalCollection[]> {
  const db = await openDB();
  const store = db.transaction("collections", "readonly").objectStore("collections");
  const results = await req(store.index("createdAt").getAll());
  db.close();
  return (results as PersonalCollection[]).reverse();
}

export async function updateCollection(
  id: string,
  updates: Partial<Pick<PersonalCollection, "title" | "description">>
): Promise<void> {
  const db = await openDB();
  const store = db.transaction("collections", "readwrite").objectStore("collections");
  const col = (await req(store.get(id))) as PersonalCollection | undefined;
  if (col) {
    Object.assign(col, updates, { updatedAt: new Date().toISOString() });
    await req(store.put(col));
  }
  db.close();
}

export async function deleteCollection(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(["collections", "documents"], "readwrite");
  await req(tx.objectStore("collections").delete(id));
  const docStore = tx.objectStore("documents");
  const docs = await req(docStore.index("collectionId").getAll(id));
  for (const doc of docs) {
    await req(docStore.delete((doc as PersonalDocument).id));
  }
  db.close();
}

// ─── Documents ───

export async function addDocument(doc: PersonalDocument): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(["documents", "collections"], "readwrite");
  await req(tx.objectStore("documents").add(doc));
  const colStore = tx.objectStore("collections");
  const col = (await req(colStore.get(doc.collectionId))) as PersonalCollection | undefined;
  if (col) {
    col.documentCount = (col.documentCount || 0) + 1;
    col.updatedAt = new Date().toISOString();
    await req(colStore.put(col));
  }
  db.close();
}

export async function getDocument(id: string): Promise<PersonalDocument | undefined> {
  const db = await openDB();
  const result = await req(
    db.transaction("documents", "readonly").objectStore("documents").get(id)
  );
  db.close();
  return result as PersonalDocument | undefined;
}

export async function getDocumentsByCollection(collectionId: string): Promise<PersonalDocument[]> {
  const db = await openDB();
  const store = db.transaction("documents", "readonly").objectStore("documents");
  const results = await req(store.index("collectionId").getAll(collectionId));
  db.close();
  return (results as PersonalDocument[]).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function deleteDocument(id: string, collectionId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(["documents", "collections"], "readwrite");
  await req(tx.objectStore("documents").delete(id));
  const colStore = tx.objectStore("collections");
  const col = (await req(colStore.get(collectionId))) as PersonalCollection | undefined;
  if (col) {
    col.documentCount = Math.max(0, (col.documentCount || 1) - 1);
    col.updatedAt = new Date().toISOString();
    await req(colStore.put(col));
  }
  db.close();
}

export async function getAllDocuments(): Promise<PersonalDocument[]> {
  const db = await openDB();
  const store = db.transaction("documents", "readonly").objectStore("documents");
  const results = await req(store.index("createdAt").getAll());
  db.close();
  return (results as PersonalDocument[]).reverse();
}

// ─── Dict Entries ───

export async function addDictEntry(entry: PersonalDictEntry): Promise<void> {
  const db = await openDB();
  await req(db.transaction("dict-entries", "readwrite").objectStore("dict-entries").add(entry));
  db.close();
}

export async function getDictEntry(id: string): Promise<PersonalDictEntry | undefined> {
  const db = await openDB();
  const result = await req(
    db.transaction("dict-entries", "readonly").objectStore("dict-entries").get(id)
  );
  db.close();
  return result as PersonalDictEntry | undefined;
}

export async function getDictEntryByText(text: string): Promise<PersonalDictEntry | undefined> {
  const db = await openDB();
  const store = db.transaction("dict-entries", "readonly").objectStore("dict-entries");
  const results = await req(store.index("text").getAll(text));
  db.close();
  return (results as PersonalDictEntry[])[0];
}

export async function getAllDictEntries(): Promise<PersonalDictEntry[]> {
  const db = await openDB();
  const store = db.transaction("dict-entries", "readonly").objectStore("dict-entries");
  const results = await req(store.index("createdAt").getAll());
  db.close();
  return (results as PersonalDictEntry[]).reverse();
}

export async function updateDictEntry(
  id: string,
  updates: Partial<Omit<PersonalDictEntry, "id" | "createdAt">>
): Promise<void> {
  const db = await openDB();
  const store = db.transaction("dict-entries", "readwrite").objectStore("dict-entries");
  const entry = (await req(store.get(id))) as PersonalDictEntry | undefined;
  if (entry) {
    Object.assign(entry, updates, { updatedAt: new Date().toISOString() });
    await req(store.put(entry));
  }
  db.close();
}

export async function importDictEntries(
  incoming: PersonalDictEntry[]
): Promise<{ added: number; updated: number; skipped: number }> {
  const db = await openDB();
  const store = db.transaction("dict-entries", "readwrite").objectStore("dict-entries");
  const textIndex = store.index("text");
  let added = 0, updated = 0, skipped = 0;
  for (const entry of incoming) {
    const existing = ((await req(textIndex.getAll(entry.text))) as PersonalDictEntry[])[0];
    if (existing) {
      const hasChanges =
        existing.hanViet !== entry.hanViet ||
        existing.pinyin !== entry.pinyin ||
        existing.definition !== entry.definition ||
        existing.partOfSpeech !== entry.partOfSpeech ||
        existing.notes !== entry.notes;
      if (hasChanges) {
        Object.assign(existing, {
          hanViet: entry.hanViet,
          pinyin: entry.pinyin,
          definition: entry.definition,
          partOfSpeech: entry.partOfSpeech,
          simplified: entry.simplified,
          entryType: entry.entryType,
          notes: entry.notes,
          updatedAt: new Date().toISOString(),
        });
        await req(store.put(existing));
        updated++;
      } else {
        skipped++;
      }
    } else {
      const now = new Date().toISOString();
      await req(
        store.add({
          ...entry,
          id: entry.id || `pd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: entry.createdAt || now,
          updatedAt: entry.updatedAt || now,
        })
      );
      added++;
    }
  }
  db.close();
  return { added, updated, skipped };
}

export async function deleteDictEntry(id: string): Promise<void> {
  const db = await openDB();
  await req(db.transaction("dict-entries", "readwrite").objectStore("dict-entries").delete(id));
  db.close();
}
