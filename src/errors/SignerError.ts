import { IProvider } from '../interface';

declare const REPOSITORY_URL: string;

const ERROR_MAP = {
    1000: (name: string) =>
        `Wrong create Signer params! Property "${name}" is undefined!`,
    1001: (propertyKey: string) =>
        `Use method "setProvider" before use "${propertyKey}"!`,
    1002: (data: { node: string; error: string }) =>
        `Fetch network byte from node with url "${data.node}" is failed! Error: ${data.error}`,
    1003: () => `No provided matcher url with create instance of Signer!`,
    1004: () => 'Failed connect to provider!',
    1005: (data: { node: string; requestName: string; message: string }) =>
        [
            `Failed request ${data.requestName} form ${data.node}!`,
            `Origin error message is "${data.message}"`,
        ].join('\n'),
    1006: (method: string) =>
        `Need auth (signer.login()) before use method "${method}"!`,
    1007: (data: {
        error: Error;
        provider: IProvider;
    }) =>
        [
            `Provider error!`,
            String(data.error),
            `Your can read about provider on site ${data.provider.repositoryUrl}`,
        ].join('\n'),
    1008: (data: { property: string; provider: IProvider }) =>
        [
            `Wrong provider interface! has no method or property "${data.property}"`,
            `Your can read about provider on site ${data.provider.repositoryUrl}`,
        ].join('\n'),
        1009: () => 
            `Expiration date is lower of now!`
};

export const ERROR_CODE_MAP = {
    WRONG_SIGNER_PARAMS: 1000 as 1000,
    NOT_PROVIDER: 1001 as 1001,
    NETWORK_BYTE_ERROR: 1002 as 1002,
    NO_MATCHER_URL_PROVIDED: 1003 as 1003,
    PROVIDER_CONNECT: 1004 as 1004,
    NETWORK_ERROR: 1005 as 1005,
    NO_AUTH_USE: 1006 as 1006,
    PROVIDER_ERROR: 1007 as 1007,
    PROVIDER_INTERFACE_ERROR: 1008 as 1008,
    WRONG_AUTH_PARAMS: 1009 as 1009,
};

export class SignerError<
    T extends keyof typeof ERROR_MAP = keyof typeof ERROR_MAP
> extends Error {
    public readonly code: T;

    constructor(code: T, param: TPapam<T>) {
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

type TPapam<T extends keyof typeof ERROR_MAP> = typeof ERROR_MAP[T] extends (
    data: infer P
) => any
    ? P
    : never;
