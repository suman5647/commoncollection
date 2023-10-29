import * as nc from 'node-cache';
import { keys } from '../config/keys';

export class CacheService {
    private cache;
    // Init node-cache
    constructor() {
        this.cache = new nc();
    }

    async getCache(key: string) {
        return this.cache.get(key);
    }

    async setCache<T>(key: string, value: T, expiry: number | string) {
        return await this.cache.set(key, value, expiry);
    }

    async deleteCache(key: any) {
        return this.cache.del(key);
    }
    async getTTl(key: string){
        return this.cache.getTtl(key);
    }
}