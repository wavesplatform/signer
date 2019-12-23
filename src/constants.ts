import { TRANSACTION_TYPE_MAP, TRANSACTION_NAME_MAP } from './interface';
import { IBroadcastOptions, IOptions } from './Waves';

export const TYPE_MAP: TRANSACTION_TYPE_MAP = {
    3: 'issue',
    4: 'transfer',
    5: 'reissue',
    6: 'burn',
    7: 'exchange',
    8: 'lease',
    9: 'cancelLease',
    10: 'alias',
    11: 'massTransfer',
    12: 'data',
    13: 'setScript',
    14: 'sponsorship',
    15: 'setAssetScript',
    16: 'invoke'
};

export const NAME_MAP: TRANSACTION_NAME_MAP = {
    'issue': 3,
    'transfer': 4,
    'reissue': 5,
    'burn': 6,
    'exchange': 7,
    'lease': 8,
    'cancelLease': 9,
    'alias': 10,
    'massTransfer': 11,
    'data': 12,
    'setScript': 13,
    'sponsorship': 14,
    'setAssetScript': 15,
    'invoke': 16
};

export const DEFAULT_OPTIONS: IOptions = {
    NODE_URL: 'https://nodes.wavesplatform.com',
    MATCHER_URL: 'https://nodes.wavesplatfomr.com/matcher'
};

export const DEFAULT_BROADCAST_OPTIONS: IBroadcastOptions = {
    chain: false,
    confirmations: -1
};

export const MAX_ALIAS_LENGTH = 30;

export const SMART_ASSET_EXTRA_FEE = 0.004 * Math.pow(10, 8);
