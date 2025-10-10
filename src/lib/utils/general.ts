export function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function deepClone<T>(item: T): T {
    return JSON.parse(JSON.stringify(item));
}

export function capitalizeFirstLetter(str: string): string {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}