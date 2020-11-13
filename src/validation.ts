import prop from 'ramda/src/prop';
import pipe from 'ramda/src/pipe';
import gte from 'ramda/src/gte';
import ifElse from 'ramda/src/ifElse';

import {
    noop,
    isEq,
    isNumberLike,
    isNumber,
    isBoolean,
    defaultValue,
    validatePipe,
    isRequired,
    orEq,
    isArray,
    isString,
    validateByShema as validateBySheme,
    isAttachment,
    isValidAliasName,
    isPublicKey,
    isValidAssetName,
    isValidAssetDescription,
    isBase64,
    isRecipient,
    isAssetId,
    isValidData,
    orderValidator,
    isValidDataPair,
    isValidUrl,
    isValidLogLevel,
    isFunction,
} from './validators';
import { TRANSACTION_TYPE, TTransactionType } from '@waves/ts-types';
import { SignerOptions, SignerTx } from '.';

const shouldValidate = (value: unknown): boolean =>
    typeof value !== 'undefined' ? true : false;

const validateOptional = (validator: (value: unknown) => boolean) =>
    ifElse(shouldValidate, validator, defaultValue(true));

type Validator = (
    scheme: { [key: string]: (value: unknown) => boolean },
    method: string
) => (
    args: Record<string, any>
) => {
    isValid: boolean;
    transaction: any;
    method: string;
    invalidFields?: string[];
};

// waves-transaction validator can't collect errors for each invalid field.
// This method can.
export const validator: Validator = (scheme, method) => (transaction) => {
    const invalidFields: string[] = Object.entries(scheme).reduce<string[]>(
        (acc, [fieldName, validationScheme]) => {
            try {
                validateBySheme(
                    { [fieldName]: validationScheme },
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    noop as any
                )(transaction);
            } catch (error) {
                invalidFields.push(fieldName);
            }

            return invalidFields;
        },
        []
    );

    return {
        isValid: invalidFields.length === 0,
        transaction,
        method,
        invalidFields,
    };
};

const getCommonValidators = (transactionType: TTransactionType) => ({
    type: isEq(transactionType),
    version: validateOptional(orEq([undefined, 1, 2, 3])),
    senderPublicKey: validateOptional(isPublicKey),
    fee: validateOptional(isNumberLike),
    proofs: validateOptional(isArray),
});

export const issueArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.ISSUE),
    name: isValidAssetName,
    description: isValidAssetDescription,
    quantity: isNumberLike,
    decimals: isNumber,
    reissuable: isBoolean,
    script: validateOptional(isBase64),
    chainId: validateOptional(isNumber),
};
export const issueArgsValidator = validator(issueArgsScheme, 'issue');

export const transferArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.TRANSFER),
    amount: isNumberLike,
    recipient: isRecipient,
    assetId: validateOptional(isAssetId),
    feeAssetId: validateOptional(isAssetId),
    attachment: validateOptional(isAttachment),
};
export const transferArgsValidator = validator(transferArgsScheme, 'transfer');

export const reissueArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.REISSUE),
    assetId: isAssetId,
    quantity: isNumberLike,
    reissuable: isBoolean,
    chainId: validateOptional(isNumber),
};
export const reissueArgsValidator = validator(reissueArgsScheme, 'reissue');

export const burnArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.BURN),
    assetId: isAssetId,
    quantity: isNumberLike,
    chainId: validateOptional(isNumber),
};
export const burnArgsValidator = validator(burnArgsScheme, 'burn');

export const leaseArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.LEASE),
    amount: isNumberLike,
    recipient: isRecipient,
};
export const leaseArgsValidator = validator(leaseArgsScheme, 'lease');

export const cancelLeaseArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.CANCEL_LEASE),
    leaseId: isAssetId,
    chainId: validateOptional(isNumber),
};
export const cancelLeaseArgsValidator = validator(
    cancelLeaseArgsScheme,
    'cancel lease'
);

export const aliasArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.ALIAS),
    alias: ifElse(isString, isValidAliasName, defaultValue(false)),
};
export const aliasArgsValidator = validator(aliasArgsScheme, 'alias');

export const massTransferArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.MASS_TRANSFER),
    transfers: validatePipe(
        isArray,
        pipe(prop('length') as any, gte(0)),
        (data: Array<unknown>) =>
            data.every(
                validatePipe(
                    isRequired(true),
                    pipe(prop('recipient') as any, isRecipient),
                    pipe(prop('amount') as any, isNumberLike)
                )
            )
    ),
    assetId: validateOptional(isAssetId),
    attachment: validateOptional(isAttachment),
};
export const massTransferArgsValidator = validator(
    massTransferArgsScheme,
    'mass transfer'
);

export const dataArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.DATA),
    data: (data: Array<unknown>) =>
        isArray(data) && data.every((item) => isValidData(item)),
};
export const dataArgsValidator = validator(dataArgsScheme as any, 'data'); // TODO fix any

export const setScriptArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.SET_SCRIPT),
    script: isBase64,
    chainId: validateOptional(isNumber),
};
export const setScriptArgsValidator = validator(
    setScriptArgsScheme as any,
    'set script'
);

export const sponsorshipArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.SPONSORSHIP),
    assetId: isAssetId,
    minSponsoredAssetFee: isNumberLike,
};
export const sponsorshipArgsValidator = validator(
    sponsorshipArgsScheme as any,
    'sponsorship'
);

export const exchangeArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.EXCHANGE),
    order1: validatePipe(isRequired(true), orderValidator),
    order2: validatePipe(isRequired(true), orderValidator),
    amount: isNumberLike,
    price: isNumberLike,
    buyMatcherFee: isNumberLike,
    sellMatcherFee: isNumberLike,
};
export const exchangeArgsValidator = validator(
    exchangeArgsScheme as any,
    'exchange'
);

export const setAssetScriptArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.SET_ASSET_SCRIPT),
    script: isBase64,
    assetId: isAssetId,
    chainId: validateOptional(isNumber),
};
export const setAssetScriptArgsValidator = validator(
    setAssetScriptArgsScheme as any,
    'set asset script'
);

export const invokeArgsScheme = {
    ...getCommonValidators(TRANSACTION_TYPE.INVOKE_SCRIPT),
    dApp: isRecipient,
    call: validateOptional(
        validatePipe(
            pipe(prop('function') as any, isString),
            pipe(prop('function') as any, prop('length') as any, gte(0)),
            pipe(prop('args') as any, isArray),
            (data: Array<unknown>) =>
                data.every(validatePipe(isRequired(true), isValidDataPair))
        )
    ),
    payment: validateOptional(
        validatePipe(isArray, (data: Array<unknown>) =>
            data.every(
                validatePipe(
                    pipe(prop('amount') as any, isNumberLike),
                    pipe(prop('assetId') as any, isAssetId)
                )
            )
        )
    ),
    feeAssetId: validateOptional(isAssetId),
    chainId: validateOptional(isNumber),
};
export const invokeArgsValidator = validator(invokeArgsScheme as any, 'invoke');

export const argsValidators = {
    [TRANSACTION_TYPE.ISSUE]: issueArgsValidator,
    [TRANSACTION_TYPE.TRANSFER]: transferArgsValidator,
    [TRANSACTION_TYPE.REISSUE]: reissueArgsValidator,
    [TRANSACTION_TYPE.BURN]: burnArgsValidator,
    [TRANSACTION_TYPE.LEASE]: leaseArgsValidator,
    [TRANSACTION_TYPE.CANCEL_LEASE]: cancelLeaseArgsValidator,
    [TRANSACTION_TYPE.ALIAS]: aliasArgsValidator,
    [TRANSACTION_TYPE.MASS_TRANSFER]: massTransferArgsValidator,
    [TRANSACTION_TYPE.DATA]: dataArgsValidator,
    [TRANSACTION_TYPE.SET_SCRIPT]: setScriptArgsValidator,
    [TRANSACTION_TYPE.SPONSORSHIP]: sponsorshipArgsValidator,
    [TRANSACTION_TYPE.EXCHANGE]: exchangeArgsValidator,
    [TRANSACTION_TYPE.SET_ASSET_SCRIPT]: setAssetScriptArgsValidator,
    [TRANSACTION_TYPE.INVOKE_SCRIPT]: invokeArgsValidator,
};

export function validateTxs<T>(
    toSign: T
): { isValid: boolean; errors: string[] };
export function validateTxs<T>(
    toSign: T[]
): { isValid: boolean; errors: string[] };
export function validateTxs<T extends SignerTx>(
    toSign: T | T[]
): { isValid: boolean; errors: string[] } {
    const signerTxs = Array.isArray(toSign) ? toSign : [toSign];

    const validateTx = (tx: SignerTx) => argsValidators[tx.type](tx);
    const knownTxPredicate = (type: TTransactionType) =>
        Object.keys(argsValidators).includes(String(type));

    const knownTxs = signerTxs.filter(({ type }) => knownTxPredicate(type));
    const unknownTxs = signerTxs.filter(({ type }) => !knownTxPredicate(type));

    const invalidTxs = knownTxs
        .map(validateTx)
        .filter(({ isValid }) => !isValid);

    if (invalidTxs.length === 0 && unknownTxs.length === 0) {
        return { isValid: true, errors: [] };
    } else {
        return {
            isValid: false,
            errors: [
                ...invalidTxs.map(
                    ({ transaction, method: scope, invalidFields }) =>
                        `Validation error for ${scope} transaction: ${JSON.stringify(
                            transaction
                        )}. Invalid arguments: ${invalidFields?.join(', ')}`
                ),
                ...unknownTxs.map(
                    (tx) =>
                        `Validation error for transaction ${JSON.stringify(
                            tx
                        )}. Unknown transaction type: ${tx.type}`
                ),
            ],
        };
    }
}

type SignerOptionsValidation = {
    isValid: boolean;
    invalidProperties: string[];
};

const validateInterface = (
    scheme: {
        [key: string]: (value: unknown) => boolean;
    },
    i: any // interface
) => {
    const invalidProperties: string[] = Object.entries(scheme)
        .filter(([fieldName, validator]) => !validator(i[fieldName]))
        .map(([fieldName]) => fieldName);

    return {
        isValid: invalidProperties.length === 0,
        invalidProperties,
    };
};

export const validateSignerOptions = (
    options: Partial<SignerOptions>
): SignerOptionsValidation => {
    const scheme = {
        NODE_URL: isValidUrl,
        MATCHER_URL: validateOptional(isValidUrl),
        LOG_LEVEL: validatePipe(isString, isValidLogLevel),
    };

    return validateInterface(scheme, options);
};

export const validateProviderInterface = (provider: object) => {
    const scheme = {
        connect: isFunction,
        login: isFunction,
        logout: isFunction,
        signMessage: isFunction,
        signTypedData: isFunction,
        sign: isFunction,
        on: isFunction,
        once: isFunction,
        off: isFunction,
        order: isFunction,
        encryptMessage: isFunction,
        decryptMessage: isFunction,
        repositoryUrl: isValidUrl,
    };

    return validateInterface(scheme, provider);
};
