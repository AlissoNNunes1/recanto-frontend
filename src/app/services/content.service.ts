import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private cache = new Map<string, any>();

  constructor() { }
 // Set a value in the cache
 set(key: string, value: any): void {
  this.cache.set(key, value);
}

// Get a value from the cache
get<T>(key: string): Observable<T | null> {
  const value = this.cache.get(key);
  return of(value);
}

// Check if the cache contains a key
has(key: string): boolean {
  return this.cache.has(key);
}

// Remove a specific key from the cache
remove(key: string): void {
  this.cache.delete(key);
}

// Clear the entire cache
clear(): void {
  this.cache.clear();
}
}
