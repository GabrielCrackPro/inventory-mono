import { Injectable } from '@angular/core';

export type StorageType = 'local' | 'session';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage: Storage;

  constructor() {
    this.storage = sessionStorage;
  }

  /**
   * Sets the storage type to use.
   * @param type - The type of storage to use, either 'local' or 'session'.
   * @description This method sets the storage type to use by reassigning the storage property.
   * It does not return anything and does not throw any errors, it simply sets the storage type.
   */
  use(type: StorageType): void {
    this.storage = type === 'local' ? localStorage : sessionStorage;
  }

  /**
   * Retrieves an item from storage.
   * @template T - The type of the item to retrieve.
   * @param key - The key of the item to retrieve.
   * @returns {T | null} - The retrieved item, or null if it doesn't exist or deserialization fails.
   * @description This method retrieves an item from storage by using the provided key.
   * It first attempts to retrieve the raw item from storage, and if successful, it then attempts to parse it as JSON.
   * If the parsing fails, it logs a warning message and returns null.
   */
  getItem<T>(key: string): T | null {
    try {
      const raw = this.storage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      console.warn(`[StorageService]: Failed to parse item with key "${key}"`);
      return null;
    }
  }

  /**
   * Saves an item to storage.
   * @template T - The type of the item to save.
   * @param key - The key of the item to save.
   * @param value - The value of the item to save.
   * @description This method saves an item to storage by first attempting to serialize it as JSON.
   * If the serialization fails, it logs an error message and does not attempt to save the item.
   */
  setItem<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      this.storage.setItem(key, json);
    } catch (error) {
      console.error(`[StorageService]: Failed to save key "${key}"`, error);
    }
  }

  /**
   * Removes an item from the current storage type.
   * @param key - The key of the item to remove.
   * @description This method removes an item from the current storage type by using the provided key.
   * If the removal fails, it logs an error message.
   */
  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService]: Failed to remove key "${key}"`, error);
    }
  }

  /**
   * Clears the current storage type by removing all items.
   * @description This method attempts to clear the current storage type by calling the clear method.
   * If the clearing fails, it logs an error message.
   */
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('[StorageService]: Failed to clear storage', error);
    }
  }

  /**
   * Checks if an item with the given key exists in storage.
   * @param key - The key of the item to check.
   * @returns {boolean} - True if the item exists, false otherwise.
   * @description This method checks if an item with the given key exists in storage by attempting to retrieve it.
   * If the retrieval fails (i.e., the item does not exist), it returns false.
   */
  has(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  /**
   * Removes multiple items from the current storage type.
   * @param keys - An array of keys to remove.
   * @description This method removes multiple items from the current storage type by calling the removeItem method for each key in the provided array.
   */
  batchRemove(keys: string[]): void {
    keys.forEach((key) => this.removeItem(key));
  }
}
