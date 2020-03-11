import {
    ERRORS,
    SignerOptionsError,
    SignerNetworkByteError,
    SignerProviderInterfaceError,
    SignerApiArgumentsError,
    SignerProviderConnectError,
    SignerError,
    SignerMissingMatcherUrlError,
    SignerBalanceError,
    SignerAuthError,
    SignerEnsureProviderError,
    SignerProviderInternalError,
    SignerOrderError,
    SignerWaitConfirmationError,
} from './SignerError';
import { IConsole } from '@waves/client-logs';
import { TLong } from '@waves/ts-types';
import { IBalanceDetails } from '@waves/node-api-js/cjs/api-node/addresses';
import { TAssetsBalance } from '@waves/node-api-js/cjs/api-node/assets';
import { SignedOrder } from './types';
import stringify from '@waves/node-api-js/cjs/tools/stringify';
import request from '@waves/node-api-js/cjs/tools/request';

const errorsMap = {
    [ERRORS.SIGNER_OPTIONS]: SignerOptionsError,
    [ERRORS.MATCHER_URL]: SignerMissingMatcherUrlError,
    [ERRORS.NETWORK_BYTE]: SignerNetworkByteError,
    [ERRORS.BALANCE]: SignerBalanceError,
    [ERRORS.NOT_AUTHORIZED]: SignerAuthError,
    [ERRORS.PROVIDER_CONNECT]: SignerProviderConnectError,
    [ERRORS.ENSURE_PROVIDER]: SignerEnsureProviderError,
    [ERRORS.PROVIDER_INTERFACE]: SignerProviderInterfaceError,
    [ERRORS.PROVIDER_INTERNAL]: SignerProviderInternalError,
    [ERRORS.PROVIDER_CONNECT]: SignerProviderConnectError,
    [ERRORS.API_ARGUMENTS]: SignerApiArgumentsError,
    [ERRORS.ORDER]: SignerOrderError,
    [ERRORS.WAIT_CONFIRMATION]: SignerWaitConfirmationError,
};

export const errorHandlerFactory = (logger: IConsole) => (
    errorCode: number,
    errorArgs?: any
) => {
    const error = new errorsMap[errorCode](errorArgs);

    logger.log(error.toString());

    return error;
};

export const normalizeBalanceDetails = (data: IBalanceDetails<TLong>) => ({
    assetId: 'WAVES',
    assetName: 'Waves',
    decimals: 8,
    amount: String(data.available),
    isMyAsset: false,
    tokens: Number(data.available) * Math.pow(10, 8),
    sponsorship: null,
    isSmart: false,
});

export const normalizeAssetsBalance = (userAddress: string) => (
    data: TAssetsBalance
) =>
    data.balances.map((item) => ({
        assetId: item.assetId,
        assetName: item.issueTransaction.name,
        decimals: item.issueTransaction.decimals,
        amount: String(item.balance),
        isMyAsset: item.issueTransaction.sender === userAddress,
        tokens: item.balance * Math.pow(10, item.issueTransaction.decimals),
        isSmart: !!item.issueTransaction.script,
        sponsorship:
            item.sponsorBalance != null &&
            item.sponsorBalance > Math.pow(10, 8) &&
            (item.minSponsoredAssetFee || 0) < item.balance
                ? item.minSponsoredAssetFee
                : null,
    }));

export const orderRequestFactory = (
    matcherUrl: string,
    handleError: (errorCode: number, errorArgs?: any) => SignerError
) => {
    const requestArgsFactory = (order: SignedOrder, market = false) => ({
        url: `/matcher/orderbook${market ? '/market' : ''}`,
        base: matcherUrl,
        options: {
            method: 'POST',
            body: stringify(order),
        },
    });

    return {
        async createLimitOrder(order: SignedOrder) {
            try {
                return request(requestArgsFactory(order));
            } catch ({ message }) {
                const error = handleError(ERRORS.ORDER, message);

                throw error;
            }
        },
        async createMarketOrder(order: SignedOrder) {
            try {
                return request(requestArgsFactory(order, true));
            } catch ({ message }) {
                const error = handleError(ERRORS.ORDER, message);

                throw error;
            }
        },
    };
};
