import Signer from './Signer';
import { SignerError, ERRORS } from './SignerError';
import { IConsole } from '@waves/client-logs';

type TSigner = { [Key in keyof Signer]: Signer[Key] } & { _console: IConsole };

export const ensureProvider = (
    target: Signer,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const origin = descriptor.value;

    descriptor.value = function(this: Signer, ...args: Array<any>): any {
        const provider = this.currentProvider;

        if (!provider) {
            const error = this._handleError(
                ERRORS.ENSURE_PROVIDER,
                propertyKey
            );

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
        return origin.apply(this, args).catch((e: Error) => {
            if (e instanceof SignerError) {
                return Promise.reject(e);
            }

            const error = new SignerError(ERROR_CODE_MAP.PROVIDER_ERROR, {
                error: e,
                provider: this.currentProvider!,
            });

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
            const error = this._handleError(ERRORS.NOT_AUTHORIZED, propertyKey);

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
            if (!this.options.MATCHER_URL) {
                const error = new SignerError(
                    ERROR_CODE_MAP.NO_MATCHER_URL_PROVIDED,
                    void 0
                );

                this._console.error(error);

                return Promise.reject(error);
            }
        }

        return origin.apply(this, args).catch((e: Error) => {
            if (e instanceof SignerError) {
                return Promise.reject(e);
            }

            const error = new SignerError(ERROR_CODE_MAP.NETWORK_ERROR, {
                node: checkData.isMatcher
                    ? this.options.MATCHER_URL!
                    : this.options.NODE_URL,
                requestName: checkData.requestName,
                message: e.message,
            });

            this._console.error(error);

            return Promise.reject(error);
        });
    };
};
