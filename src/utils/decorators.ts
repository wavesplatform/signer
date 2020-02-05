import Signer from '../Signer';
import { SignerError, ERROR_CODE_MAP } from '../errors/SignerError';
import { IConsole } from '@waves/client-logs';

type TSigner = { [Key in keyof Signer]: Signer[Key] } & { _console: IConsole };

export const checkProvider = (
    target: Signer,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const origin = descriptor.value;
    descriptor.value = function(this: TSigner, ...args: Array<any>): any {
        const provider = this.currentProvider;

        if (!provider) {
            this._console.error(
                `Can't use method ${propertyKey} without instance of provider!`
            );
            throw new SignerError(ERROR_CODE_MAP.NOT_PROVIDER, propertyKey);
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
        if (this.currentProvider!.state.activeUser == null) {
            const error = new SignerError(
                ERROR_CODE_MAP.NO_AUTH_USE,
                propertyKey
            );
            this._console.error(error);
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
