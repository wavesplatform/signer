declare const REPOSITORY_URL: string;

const ERROR_MAP = {
    1010: (validationErrors: string[]): string => {
        return `Validation errors:\n${validationErrors.join('    \n')}`;
    },
};

export const ERROR_CODE_MAP = {
    VALIDATION: 1010 as 1010,
};

export class SignerError<
    T extends keyof typeof ERROR_MAP = keyof typeof ERROR_MAP
> extends Error {
    public readonly code: T;

    constructor(code: T, param: Param<T>) {
        super(ERROR_MAP[code](param as any));
        this.code = code;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, SignerError.prototype);
    }

    public toString(): string {
        return [
            `Signer error with code ${this.code}!`,
            `Error: ${this.message}`,
            `Read about error codes in ${REPOSITORY_URL}/readme.md#error-codes`,
        ].join('\n');
    }
}

type Param<T extends keyof typeof ERROR_MAP> = typeof ERROR_MAP[T] extends (
    data: infer P
) => any
    ? P
    : never;
