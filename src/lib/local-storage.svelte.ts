import { browser } from '$app/environment';

export class LocalStore<T extends object> {
    value = $state<T>() as T;
    key = '';

    constructor(key: string, value: T) {
        this.key = key;
        this.value = value;

        if (browser) {
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    const parsed = this.deserialize(saved) as T;
                    // 合并而不是替换，保持代理
                    Object.assign(this.value, parsed);
                } catch {
                    /* ignore parse error */
                }
            }
        }

        $effect(() => {
            if (!browser) return;
            localStorage.setItem(this.key, this.serialize(this.value));
        });
    }

    serialize(value: T): string {
        return JSON.stringify(value);
    }

    deserialize(item: string): T {
        return JSON.parse(item);
    }
}

export function localStore<T extends object>(key: string, value: T) {
    return new LocalStore<T>(key, value);
}


// export function readLocalMurmurDraft(): string | null {
//     if (browser) {
//         return localStorage.getItem("murmurDraft");
//     }
//     return null;

// }

// export function writeLocalMurmurDraft(value: object): void {
//     if (browser) {
//         localStorage.setItem(key, JSON.stringify(value));
//     }
// }