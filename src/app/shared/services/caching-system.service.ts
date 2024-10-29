import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CachingSystemService {

    private expirationTime = 2 * 60 * 60 * 1000; // default 2 hours

    constructor() {
        this.initializeCleaningInterval();
    }

    setDefaultExpirationTime(expirationTime: number): void {
        this.expirationTime = expirationTime;
    }

    addDataToCache<T>(key: string, data: T, customExpirationTime?: number): void {
        const expirationTime = Date.now() + (customExpirationTime ?? this.expirationTime);
        const cacheEntry = {
            data,
            expirationTime
        };
        localStorage.setItem(key + 'Cache', JSON.stringify(cacheEntry));
    }

    getItem<T>(key: string): T | null {
        const cacheEntry = localStorage.getItem(key + 'Cache');

        if (!cacheEntry) {
            return null;
        }

        return JSON.parse(cacheEntry).data;
    }

    clearExpiredItems(): void {
        console.log('Clearing expired items...');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('Cache')) {
                const cacheEntry = localStorage.getItem(key);
                if (cacheEntry) {
                    const parsedEntry = JSON.parse(cacheEntry);
                    if (Date.now() > parsedEntry.expirationTime) {
                        this.removeItemFromCache(key);
                    }
                }
            }
        }
    }

    removeItemFromCache(key: string): void {
        console.log(`Removing item from cache with key: ${key}`);
        localStorage.removeItem(key);
    }

    private initializeCleaningInterval(): void {
        setInterval(() => this.clearExpiredItems(), 60 * 1000);
    }
}
