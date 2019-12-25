export declare function toArray<T>(data: T | Array<T>): Array<T>;
export declare function wait(time: number): Promise<void>;
export declare function evolve<T extends Record<string, any>, R extends (key: keyof T, value: T[keyof T]) => any>(data: T, process: R): {
    [Key in keyof T]: ReturnType<R>;
};
