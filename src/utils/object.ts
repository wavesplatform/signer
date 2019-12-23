export const keys = <T extends Record<string | number, any>>(obj: T): Array<keyof T> =>
    Object.keys(obj);

export const entries = <T extends Record<string | number, any>>(obj: T): Array<[keyof T, T[keyof T]]> =>
    Object.keys(obj).map(name => [name, obj[name]]);

export const values = <T extends Record<string | number, any>>(obj: T): Array<T[keyof T]> =>
    Object.keys(obj).map(key => obj[key]);
