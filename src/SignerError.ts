const REPOSITORY_URL = 'http://';

export const ERRORS = {
    SIGNER_OPTIONS: 1000 as 1000,
    MATCHER_URL: 1001 as 1001,
    NETWORK_BYTE: 1002 as 1002,
    BALANCE: 1003 as 1003,
    BROADCAST: 1004 as 1004,
    NOT_AUTHORIZED: 1005 as 1005,
    PROVIDER_CONNECT: 1006 as 1006,
    ENSURE_PROVIDER: 1007 as 1007,
    PROVIDER_INTERFACE: 1008 as 1008,
    PROVIDER_INTERNAL: 1009 as 1009,
    API_ARGUMENTS: 1010 as 1010,
    ORDER: 1011 as 1011,
    WAIT_CONFIRMATION: 1012 as 1012,
};

type ErrorDetails = {
    code: number;
    title: string;
    type: string;
    details?: string;
    errorArgs: any;
};

export class SignerError extends Error {
    public readonly code: number;
    private readonly errorDetails: ErrorDetails;

    constructor(details: ErrorDetails) {
        super(details.title);

        this.code = details.code;
        this.errorDetails = details;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, SignerError.prototype);
    }

    public toString(): string {
        const details = this.errorDetails.details
            ? `    Details: ${this.errorDetails.details}`
            : undefined;

        return [
            `Signer error`,
            `    Title: ${this.errorDetails.title}`,
            `    Type: ${this.errorDetails.type}`,
            `    Code: ${this.errorDetails.code}`,
            details,
            `    More info: ${REPOSITORY_URL}/readme.md#error-codes`,
        ]
            .filter(Boolean)
            .join('\n');
    }
}

export class SignerOptionsError extends SignerError {
    constructor(args: string[]) {
        super({
            code: ERRORS.SIGNER_OPTIONS,
            title: 'Invalid signer options',
            type: 'validation',
            details: `\n        Invalid signer options: ${args.join(', ')}`,
            errorArgs: args,
        });

        Object.setPrototypeOf(this, SignerOptionsError.prototype);
    }
}

export class SignerApiArgumentsError extends SignerError {
    constructor(args: string[]) {
        super({
            code: ERRORS.API_ARGUMENTS,
            title: 'Invalid api method arguments',
            type: 'validation',
            details: `\n        ${args.join('\n        ')}`,
            errorArgs: args,
        });

        Object.setPrototypeOf(this, SignerApiArgumentsError.prototype);
    }
}

export class SignerNetworkByteError extends SignerError {
    constructor({ error, node }: { error: string; node: string }) {
        super({
            code: ERRORS.NETWORK_BYTE,
            title: 'Network byte fetching has failed',
            type: 'network',
            details: `\n        Could not fetch network from ${node}: ${error}`,
            errorArgs: { error, node },
        });

        Object.setPrototypeOf(this, SignerNetworkByteError.prototype);
    }
}

export class SignerProviderInterfaceError extends SignerError {
    constructor(invalidProperties: string[]) {
        super({
            code: ERRORS.NETWORK_BYTE,
            title: 'Invalid Provider interface',
            type: 'validation',
            details: `\n        Invalid provider properties: ${invalidProperties.join(
                ', '
            )}`,
            errorArgs: invalidProperties,
        });

        Object.setPrototypeOf(this, SignerProviderInterfaceError.prototype);
    }
}

export class SignerProviderConnectError extends SignerError {
    constructor({ error, node }: { error: string; node: string }) {
        super({
            code: ERRORS.PROVIDER_CONNECT,
            title: 'Could not connect the Provider',
            type: 'network',
            errorArgs: { error, node },
        });

        Object.setPrototypeOf(this, SignerProviderConnectError.prototype);
    }
}

export class SignerEnsureProviderError extends SignerError {
    constructor(method: string) {
        super({
            code: ERRORS.ENSURE_PROVIDER,
            title: 'Provider instance is missing',
            type: 'provider',
            details: `Can't use method: ${method}. Provider instance is missing`,
            errorArgs: { failedMethod: method },
        });

        Object.setPrototypeOf(this, SignerEnsureProviderError.prototype);
    }
}

export class SignerProviderInternalError extends SignerError {
    constructor(message: string) {
        super({
            code: ERRORS.PROVIDER_INTERNAL,
            title: 'Provider internal error',
            type: 'provider',
            details: `Provider internal error: ${message}`,
            errorArgs: { errorMessage: message },
        });

        Object.setPrototypeOf(this, SignerProviderInternalError.prototype);
    }
}

export class SignerAuthError extends SignerError {
    constructor(method: string) {
        super({
            code: ERRORS.NOT_AUTHORIZED,
            title: 'Authorization error',
            type: 'authorization',
            details: `Can't use method: ${method}. User must be logged in`,
            errorArgs: { failedMethod: method },
        });

        Object.setPrototypeOf(this, SignerAuthError.prototype);
    }
}

export class SignerBalanceError extends SignerError {
    constructor(message: string) {
        super({
            code: ERRORS.BALANCE,
            title: 'Balance fetching has failed',
            type: 'network',
            details: `Could not fetch user balances: ${message}`,
            errorArgs: { errorMessage: message },
        });

        Object.setPrototypeOf(this, SignerBalanceError.prototype);
    }
}

export class SignerBroadcastError extends SignerError {
    constructor(message: string) {
        super({
            code: ERRORS.BROADCAST,
            title: 'Could not broadcast transactions',
            type: 'network',
            details: `Could not broadcast transactions: ${message}`,
            errorArgs: { errorMessage: message },
        });

        Object.setPrototypeOf(this, SignerBroadcastError.prototype);
    }
}

export class SignerMissingMatcherUrlError extends SignerError {
    constructor() {
        super({
            code: ERRORS.MATCHER_URL,
            title: 'Missing matcher url option',
            type: 'validation',
            details: `Signer should have been instatiated with MATCHER_URL option`,
            errorArgs: undefined,
        });

        Object.setPrototypeOf(this, SignerMissingMatcherUrlError.prototype);
    }
}

export class SignerOrderError extends SignerError {
    constructor(message: string) {
        super({
            code: ERRORS.ORDER,
            title: 'Could not create order',
            type: 'network',
            details: `Could not create order: ${message}`,
            errorArgs: undefined,
        });

        Object.setPrototypeOf(this, SignerOrderError.prototype);
    }
}

export class SignerWaitConfirmationError extends SignerError {
    constructor() {
        super({
            code: ERRORS.WAIT_CONFIRMATION,
            title: 'Wait transactions confirmation request has failed',
            type: 'network',
            errorArgs: undefined,
        });

        Object.setPrototypeOf(this, SignerWaitConfirmationError.prototype);
    }
}

export type SignerErrorType =
    | SignerProviderInterfaceError
    | SignerProviderConnectError;
