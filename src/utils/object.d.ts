export declare const keys: <T extends Record<import("../interface").TLong, any>>(obj: T) => (keyof T)[];
export declare const entries: <T extends Record<import("../interface").TLong, any>>(obj: T) => [keyof T, T[keyof T]][];
export declare const values: <T extends Record<import("../interface").TLong, any>>(obj: T) => T[keyof T][];
