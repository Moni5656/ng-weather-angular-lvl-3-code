import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CachingSystemService {

    private static readonly CLEANING_INTERVAL = 60 * 1000; // 1 Minute
    private static readonly DEFAULT_EXPIRATION_TIME = 2 * 60 * 60 * 1000; //  2 hours
    private expirationTime = CachingSystemService.DEFAULT_EXPIRATION_TIME

    constructor() {
        this.initializeCleaningInterval();
    }

    // use this method to overwrite the default expiration time for each newly added item
    setDefaultExpirationTime(expirationTime: number): void {
        this.expirationTime = expirationTime;
    }

    // or use the customExpirationTime parameter to adjust the expiration time
    addDataToCache<T>(key: string, data: T, customExpirationTime?: number): void {
        const expirationTime = Date.now() + (customExpirationTime ?? this.expirationTime);
        const cacheEntry = {
            data,
            expirationTime
        };
        localStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheEntry));
    }

    getItem<T>(key: string): T | null {
        const cacheEntry = localStorage.getItem(this.getCacheKey(key));

        if (!cacheEntry) {
            return null;
        }

        return JSON.parse(cacheEntry).data;
    }

    clearExpiredItems(): void {
        console.log('Clearing expired items...');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (!key || !key.includes('Cache')) {
                continue;
            }

            const cacheEntry = localStorage.getItem(key);

            if (!cacheEntry) {
                continue;
            }

            const parsedEntry = JSON.parse(cacheEntry);
            if (Date.now() > parsedEntry.expirationTime) {
                this.removeItemFromCache(key);
            }
        }
    }

    removeItemFromCache(key: string): void {
        console.log(`Removing item from cache with key: ${key}`);
        localStorage.removeItem(key);
    }

    private initializeCleaningInterval(): void {
        setInterval(() => this.clearExpiredItems(), CachingSystemService.CLEANING_INTERVAL);
    }

    private getCacheKey(key: string): string {
        return `${key}Cache`;
    }
}
