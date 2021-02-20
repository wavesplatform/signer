import defaultTo from 'ramda/src/defaultTo';
import prop from 'ramda/src/prop';
import ifElse from 'ramda/src/ifElse';
import pipe from 'ramda/src/pipe';
import equals from 'ramda/src/equals';
import gte from 'ramda/src/gte';
import lte from 'ramda/src/lte';
import startsWith from 'ramda/src/startsWith';
import isNil from 'ramda/src/isNil';
import includes from 'ramda/src/includes';
import flip from 'ramda/src/flip';
import always from 'ramda/src/always';
import tryCatch from 'ramda/src/tryCatch';
import { base58Decode } from '@waves/ts-lib-crypto';

const TX_DEFAULTS = {
    MAX_ATTACHMENT: 140,
    ALIAS: {
        AVAILABLE_CHARS: '-.0123456789@_abcdefghijklmnopqrstuvwxyz',
        MAX_ALIAS_LENGTH: 30,
        MIN_ALIAS_LENGTH: 4,
    },
};

export const isArray = (value: unknown) => Array.isArray(value);

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
    !isNaN(Number(value));

export const isNumberLike = (value: unknown) =>
    value != null && !isNaN(Number(value)) && !!(value || value === 0);

export const isBoolean = (value: unknown) =>
    value != null && (typeof value === 'boolean' || value instanceof Boolean);

export const orEq: <T>(list: Array<T>) => (item: T) => boolean = flip(includes) as any;

export const exception = (msg: string) => {
    throw new Error(msg);
};

export const validateBySchema = (
    schema: Record<string, Function>,
    errorTpl: (key: string, value?: unknown) => string,
) => (tx: Record<string, any>) => {
    Object.entries(schema).forEach(([key, cb]) => {
        const value = prop(key, tx || {});

        if (!cb(value)) {
            exception(errorTpl(key, value));
        }
    });

    return true;
};

export const isAttachment = ifElse(
    orEq([null, undefined]),
    defaultTo(true),
    ifElse(
        isString,
        // TODO Fix attachment gte(TX_DEFAULTS.MAX_ATTACHMENT)
        pipe(prop('length'), always(true)),
        defaultTo(false),
    ),
);

const validateChars = (chars: string) => (value: string) =>
    value.split('').every((char: string) => chars.includes(char));

export const isValidAliasName = ifElse(
    validateChars(TX_DEFAULTS.ALIAS.AVAILABLE_CHARS),
    pipe(
        prop('length'),
        validatePipe(
            gte(TX_DEFAULTS.ALIAS.MAX_ALIAS_LENGTH),
            lte(TX_DEFAULTS.ALIAS.MIN_ALIAS_LENGTH),
        ),
    ),
    defaultTo(false),
);

export const ASSETS = {
    NAME_MIN_BYTES: 4,
    NAME_MAX_BYTES: 16,
    DESCRIPTION_MAX_BYTES: 1000,
};

export const isBase64 = validatePipe(
    ifElse(
        isString,
        startsWith('base64:'),
        pipe(isNil)
    )
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
        prop<'key', string>('key'),
        validatePipe(isString, (key: string) => !!key),
    ),
    isValidDataPair,
);

export const isPublicKey = validatePipe(
    isString,
    tryCatch((v) => base58Decode(v).length === 32, always(false))
);

export const isValidAssetName = validatePipe(
    isString,
    pipe(
        prop<'length', number>('length'),
        ifElse(
            lte(ASSETS.NAME_MIN_BYTES),
            gte(ASSETS.NAME_MAX_BYTES),
            defaultTo(false),
        ),
    ),
);

export const isValidAssetDescription = validatePipe(
    isString,
    pipe(prop<'length', number>('length'), gte(ASSETS.DESCRIPTION_MAX_BYTES)),
);

export const isAssetId = validatePipe(
    ifElse(
        orEq(['', null, undefined, 'WAVES']),
        defaultTo(true),
        isString,
    ),
);

export const isAlias = (value: string) => value.startsWith('alias:');

// TODO fix validator!!!
export const isValidAddress = isString

export const isValidAlias = pipe(
    (value: string) => value.split(':')[2],
    isValidAliasName,
);

export const isRecipient = validatePipe(
    isString,
    ifElse(isAlias, isValidAlias, isValidAddress),
);

const orderScheme = {
    orderType: orEq(['sell', 'buy']),
    senderPublicKey: isPublicKey,
    matcherPublicKey: isPublicKey,
    version: orEq([undefined, 0, 1, 2, 3]),
    assetPair: validatePipe(
        isRequired(true),
        pipe(prop<string, string | null>('amountAsset'), isAssetId),
        pipe(prop<string, string | null>('priceAsset'), isAssetId),
    ),
    price: isNumberLike,
    amount: isNumberLike,
    matcherFee: isNumberLike,
    expiration: isNumberLike,
    timestamp: isNumber,
    proofs: ifElse(isArray, defaultTo(true), orEq([undefined])),
};

const v12OrderScheme = {
    matcherFeeAssetId: orEq([undefined, null, 'WAVES']),
};

const v3OrderScheme = {
    matcherFeeAssetId: isAssetId,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {
};

// TODO!!!
const validateOrder = validateBySchema(orderScheme, noop as any);
const validateOrderV2 = validateBySchema(v12OrderScheme, noop as any);
const validateOrderV3 = validateBySchema(v3OrderScheme, noop as any);

export const orderValidator = validatePipe(
    validateOrder,
    ifElse(pipe(prop('version'), equals(3)), validateOrderV3, validateOrderV2),
);
