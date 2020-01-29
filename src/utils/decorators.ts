import Signer from '../Signer';

export const checkProvider = (
    target: Signer,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const origin = descriptor.value; 
    descriptor.value = function (this: Signer, ...args: Array<any>): any {
        if (!this.currentProvider) {
            throw new Error(`Use method "setProvider" before use "${propertyKey}"!`);
        }
        return origin.apply(this, args);
    }
};
