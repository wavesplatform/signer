import { entries } from './object';


export function toArray<T>(data: T | Array<T>): Array<T> {
    return Array.isArray(data) ? data : [data];
}

export function wait(time: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

export function evolve<T extends Record<string, any>, R extends (key: keyof T, value: T[keyof T]) => any>(data: T, process: R): { [Key in keyof T]: ReturnType<R> } {
    return entries(data).reduce((acc: any, [key, value]) => {
        acc[key] = process(key, value);
        return acc;
    }, {}) as any;
}
