export function filterItems<T>(items: readonly T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}

export function sortItems<T>(items: readonly T[], compare: (a: T, b: T) => number): T[] {
  return [...items].sort(compare);
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class LocalRepository<T extends { id: string }> {
  private readonly storageKey: string;
  private readonly adapter: StorageAdapter | null;

  constructor(storageKey: string, adapter?: StorageAdapter) {
    this.storageKey = storageKey;
    this.adapter = adapter ?? (typeof window !== 'undefined' ? window.localStorage : null);
  }

  load(fallback: T[]): T[] {
    if (!this.adapter) {
      return [...fallback];
    }

    try {
      const raw = this.adapter.getItem(this.storageKey);
      if (!raw) {
        return [...fallback];
      }
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [...fallback];
    } catch {
      return [...fallback];
    }
  }

  save(items: T[]): void {
    if (!this.adapter) {
      return;
    }
    this.adapter.setItem(this.storageKey, JSON.stringify(items));
  }

  findById(items: readonly T[], id: string): T | undefined {
    return items.find((item) => item.id === id);
  }
}
