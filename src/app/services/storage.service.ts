import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Use optional chaining for brevity and safety
  public set(key: string, value: any): Promise<void> {
    return this._storage?.set(key, value) || Promise.reject(new Error('Storage not initialized')); //Improved error handling
  }


  public get(key: string): Promise<any> {
    return this._storage?.get(key) || Promise.reject(new Error("Storage not initialized")); //Improved error handling
  }


  public remove(key: string): Promise<void> {
    return this._storage?.remove(key) || Promise.reject(new Error("Storage not initialized")); //Improved error handling
  }

  
  public clear(): Promise<void> {
    return this._storage?.clear() || Promise.reject(new Error("Storage not initialized")); //Improved error handling
  }
}