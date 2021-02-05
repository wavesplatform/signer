import Signer, { SignerOptions } from './Signer';
import { SignerError, ERRORS } from './SignerError';
import { IConsole } from '@waves/client-logs';
import { ErrorHandler } from './helpers';

type TSigner = { [Key in keyof Signer]: Signer[Key] } & {
    _console: IConsole;
    _handleError: ErrorHandler;
    _options: SignerOptions;
};

const getErrorHandler = (signer: TSigner): ErrorHandler => {
    return signer._handleError;
};

export const ensureProvider = (
    target: Signer,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const origin = descriptor.value;

    descriptor.value = function(this: TSigner, ...args: Array<any>): any {
        const provider = this.currentProvider;

        if (!provider) {
            const handler = getErrorHandler(this);
            const error = handler(ERRORS.ENSURE_PROVIDER, [propertyKey]);

            throw error;
        }

        return origin.apply(this, args);
    };
};

export const catchProviderError = (
    target: Signer,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const origin = descriptor.value;

    descriptor.value = function(this: TSigner, ...args: Array<any>): any {
        return origin.apply(this, args).catch((e: any) => {
            if (e === 'Error: User rejection!') {
                return Promise.reject(e);
            }

            if (e instanceof SignerError) {
                return Promise.reject(e);
            }

            const handler = getErrorHandler(this);
            const error = handler(ERRORS.PROVIDER_INTERNAL, [e.message]);

            this._console.error(error);

            return Promise.reject(e);
        });
    };
};

export const checkAuth = (
    target: Signer,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const origin = descriptor.value;

    descriptor.value = function(this: TSigner, ...args: Array<any>): any {
        if (this.currentProvider!.user == null) {
            const handler = getErrorHandler(this);
            const error = handler(ERRORS.NOT_AUTHORIZED, [propertyKey]);

            throw error;
        }

        return origin.apply(this, args);
    };
};

export const catchNetworkErrors = (checkData: {
    requestName: string;
    isMatcher?: boolean;
}) => (target: Signer, propertyKey: string, descriptor: PropertyDescriptor) => {
    const origin = descriptor.value;

    descriptor.value = function(this: TSigner, ...args: Array<any>): any {
        if (checkData.isMatcher) {
            // TODO
            // if (!this._options.MATCHER_URL) {
            //     const error = new SignerError(
            //         ERROR_CODE_MAP.NO_MATCHER_URL_PROVIDED,
            //         void 0
            //     );
            //
            //     this._console.error(error);
            //
            //     return Promise.reject(error);
            // }
        }

        return origin.apply(this, args).catch((e: Error) => {
            if (e instanceof SignerError) {
                return Promise.reject(e);
            }

            const handler = getErrorHandler(this);
            // TODO Provide more details for request error!
            const error = handler(ERRORS.NETWORK_ERROR, [{}]);

            this._console.error(error);

            return Promise.reject(error);
        });
    };
};
