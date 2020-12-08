const REPOSITORY_URL = 'http://github.com/wavesplatform/signer';

export const ERRORS = {
    SIGNER_OPTIONS: 1000 as 1000,
    NETWORK_BYTE: 1001 as 1001,
    NOT_AUTHORIZED: 1002 as 1002,
    PROVIDER_CONNECT: 1003 as 1003,
    ENSURE_PROVIDER: 1004 as 1004,
    PROVIDER_INTERFACE: 1005 as 1005,
    PROVIDER_INTERNAL: 1006 as 1006,
    API_ARGUMENTS: 1007 as 1007,
    NETWORK_ERROR: 1008 as 1008
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
            `Signer error:`,
            `    Title: ${this.errorDetails.title}`,
            `    Type: ${this.errorDetails.type}`,
            `    Code: ${this.errorDetails.code}`,
            details,
            `    More info: ${REPOSITORY_URL}/README.md#error-codes`,
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

        Object.setPrototypeOf(this, SignerProviderConnectError.prototype);
    }
}

export class SignerProviderInternalError extends SignerError {
    constructor(message: string) {
        super({
            code: ERRORS.ENSURE_PROVIDER,
            title: 'Provider internal error',
            type: 'provider',
            details: `Provider internal error: ${message}`,
            errorArgs: { errorMessage: message },
        });

        Object.setPrototypeOf(this, SignerProviderConnectError.prototype);
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

        Object.setPrototypeOf(this, SignerProviderConnectError.prototype);
    }
}

export class SignerNetworkError extends SignerError {
    // TODO REMOVE ANY, ADD MORE DETAILS
    constructor(params: any) {
        super({
            code: ERRORS.NETWORK_ERROR,
            title: 'Network Error',
            type: 'network',
            details: `Error connect to ${''}`,
            errorArgs: {},
        });
    }
}

export type SignerErrorType =
    | SignerProviderInterfaceError
    | SignerProviderConnectError;
