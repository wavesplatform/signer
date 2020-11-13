import prop from 'ramda/src/prop';
import pipe from 'ramda/src/pipe';
import lte from 'ramda/src/lte';
import gte from 'ramda/src/gte';
import ifElse from 'ramda/src/ifElse';

const TX_DEFAULTS = {
    MAX_ATTACHMENT: 140,
    ALIAS: {
        AVAILABLE_CHARS: '-.0123456789@_abcdefghijklmnopqrstuvwxyz',
        MAX_ALIAS_LENGTH: 30,
        MIN_ALIAS_LENGTH: 4,
    },
};

export const getByteStringLength = (s: string): number => {
    if (window.TextDecoder) {
        return new TextEncoder().encode(s).length;
    } else {
        const m = encodeURIComponent(s).match(/%[89ABab]/g);

        return s.length + (m ? m.length : 0);
    }
};

export const isArray = (value: unknown) => Array.isArray(value);

export const defaultValue = (value: unknown) => () => value;

export const validatePipe = (...args: Array<Function>) => (value: unknown) => {
    let isValid = true;

    for (const cb of args) {
        isValid = !!cb(value);
        if (!isValid) {
            return false;
        }
    }

    return isValid;
};

export const isRequired = (required: boolean) => (value: unknown) =>
    !required || value != null;

export const isString = (value: unknown) =>
    typeof value === 'string' || value instanceof String;

export const isNumber = (value: unknown) =>
    (typeof value === 'number' || value instanceof Number) &&
    !isNaN(Number(value)) &&
    Number.isInteger(Number(value));

export const isNumberLike = (value: unknown) =>
    value != null &&
    !isNaN(Number(value)) &&
    !!(value || value === 0) &&
    Number.isInteger(Number(value));

export const isBoolean = (value: unknown) =>
    value != null && (typeof value === 'boolean' || value instanceof Boolean);

export const isEq = <T>(reference: T) => (value: unknown) => {
    switch (true) {
        case isNumber(value) && isNumber(reference):
            return Number(value) === Number(reference);
        case isString(value) && isString(reference):
            return String(reference) === String(value);
        case isBoolean(value) && isBoolean(reference):
            return Boolean(value) === Boolean(reference);
        default:
            return reference === value;
    }
};

export const orEq = (referencesList: Array<unknown>) => (value: unknown) =>
    referencesList.some(isEq(value));

export const exception = (msg: string) => {
    throw new Error(msg);
};

export const validateByShema = (
    shema: Record<string, Function>,
    errorTpl: (key: string, value?: unknown) => string
) => (tx: Record<string, any>) => {
    Object.entries(shema).forEach(([key, cb]) => {
        const value = prop(key)(tx || {});

        if (!cb(value)) {
            exception(errorTpl(key, value));
        }
    });

    return true;
};

export const isAttachment = ifElse(
    orEq([null, undefined]),
    defaultValue(true),
    ifElse(
        isString,
        pipe(getByteStringLength, lte(TX_DEFAULTS.MAX_ATTACHMENT)),
        defaultValue(false)
    )
);

const validateChars = (chars: string) => (value: string) =>
    value.split('').every((char: string) => chars.includes(char));

export const isValidAliasName = ifElse(
    validateChars(TX_DEFAULTS.ALIAS.AVAILABLE_CHARS),
    pipe(
        prop('length'),
        validatePipe(
            lte(TX_DEFAULTS.ALIAS.MAX_ALIAS_LENGTH),
            gte(TX_DEFAULTS.ALIAS.MIN_ALIAS_LENGTH)
        )
    ),
    defaultValue(false)
);

export const ASSETS = {
    NAME_MIN_BYTES: 4,
    NAME_MAX_BYTES: 16,
    DESCRIPTION_MAX_BYTES: 1000,
};

export const isBase64 = validatePipe(isString, (v: string) =>
    v.startsWith('base64:')
);

export const validateType = {
    integer: isNumberLike,
    boolean: isBoolean,
    string: isString,
    binary: isBase64,
};

export const isValidDataPair = (data: {
    type: keyof typeof validateType;
    value: unknown;
}) => !!(validateType[data.type] && validateType[data.type](data.value));

export const isValidData = validatePipe(
    isRequired(true),
    pipe(
        prop('key') as any,
        validatePipe(isString, (key: string) => !!key)
    ),
    isValidDataPair
);

export const isPublicKey = validatePipe(
    isString,
    (v: string) => v.length === 32
);

export const isValidAssetName = validatePipe(
    isString,
    pipe(
        getByteStringLength,
        ifElse(
            gte(ASSETS.NAME_MIN_BYTES),
            lte(ASSETS.NAME_MAX_BYTES),
            defaultValue(false)
        )
    )
);

export const isValidAssetDescription = validatePipe(
    isString,
    pipe(getByteStringLength, lte(ASSETS.DESCRIPTION_MAX_BYTES))
);

export const isAssetId = validatePipe(
    ifElse(
        orEq(['', null, undefined, 'WAVES']),
        defaultValue(true),
        (v: string) => v.length === 44
    )
);

export const isAlias = (value: string) => value.startsWith('alias:');

export const isValidAddress = (value: string) => isEq(32)(value.length);

export const isValidAlias = pipe(
    (value: string) => value.split(':')[2],
    isValidAliasName
);

export const isRecipient = validatePipe(
    isString,
    ifElse(isAlias, isValidAlias, isValidAddress)
);

const orderScheme = {
    orderType: orEq(['sell', 'buy']),
    senderPublicKey: isPublicKey,
    matcherPublicKey: isPublicKey,
    version: orEq([undefined, 0, 1, 2, 3]),
    assetPair: validatePipe(
        isRequired(true),
        pipe(prop('amountAsset') as any, isAssetId),
        pipe(prop('priceAsset') as any, isAssetId)
    ),
    price: isNumberLike,
    amount: isNumberLike,
    matcherFee: isNumberLike,
    expiration: isNumberLike,
    timestamp: isNumber,
    proofs: ifElse(isArray, defaultValue(true), orEq([undefined])),
};

const v12OrderScheme = {
    matcherFeeAssetId: orEq([undefined, null, 'WAVES']),
};

const v3OrderScheme = {
    matcherFeeAssetId: isAssetId,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

const validateOrder = validateByShema(orderScheme, noop as any);
const validateOrderV2 = validateByShema(v12OrderScheme, noop as any);
const validateOrderV3 = validateByShema(v3OrderScheme, noop as any);

export const orderValidator = validatePipe(
    validateOrder,
    ifElse(pipe(prop('version'), isEq(3)), validateOrderV3, validateOrderV2)
);

export const isValidUrl = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;

    try {
        new URL(value);

        return true;
    } catch (error) {
        return false;
    }
};

export const isValidLogLevel = (value: string): boolean =>
    ['verbose', 'production', 'error'].includes(value);

export const isFunction = (value: unknown): boolean =>
    typeof value === 'function';
