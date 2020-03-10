import {
    ERRORS,
    SignerOptionsError,
    SignerNetworkByteError,
    SignerProviderInterfaceError,
    SignerApiArgumentsError,
    SignerProviderConnectError,
} from './SignerError';
import { IConsole } from '@waves/client-logs';

const errorsMap = {
    [ERRORS.SIGNER_OPTIONS]: SignerOptionsError,
    [ERRORS.NETWORK_BYTE]: SignerNetworkByteError,
    [ERRORS.PROVIDER_INTERFACE]: SignerProviderInterfaceError,
    [ERRORS.API_ARGUMENTS]: SignerApiArgumentsError,
    [ERRORS.PROVIDER_CONNECT]: SignerProviderConnectError,
};

export const errorHandlerFactory = (logger: IConsole) => (
    errorCode: number,
    errorArgs: any
) => {
    const error = new errorsMap[errorCode](errorArgs);

    logger.log(error.toString());

    return error;
};
