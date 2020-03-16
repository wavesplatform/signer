import OriginalSigner from './Signer';
import { ERRORS, SignerError } from './SignerError';

type Signer = { [Key in keyof OriginalSigner]: OriginalSigner[Key] } & {
    _handleError(errorCode: number, errorArgs?: any): SignerError;
};

export const ensureProvider = (
    target: OriginalSigner,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const origin = descriptor.value;

    descriptor.value = function(this: Signer, ...args: Array<any>): any {
        const provider = this.provider;

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

export const handleProviderInternalErrors = (
    target: Signer,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const origin = descriptor.value;

    descriptor.value = async function(
        this: Signer,
        ...args: Array<any>
    ): Promise<any> {
        try {
            return await origin.apply(this, args);
        } catch ({ message }) {
            const error = this._handleError(ERRORS.PROVIDER_INTERNAL, message);

            throw error;
        }
    };
};

export const ensureAuth = (
    target: Signer,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const origin = descriptor.value;

    descriptor.value = function(this: Signer, ...args: Array<any>): any {
        if (this.provider!.user == null) {
            const error = this._handleError(ERRORS.NOT_AUTHORIZED, propertyKey);

            throw error;
        }

        return origin.apply(this, args);
    };
};
