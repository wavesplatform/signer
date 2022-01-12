import { BroadcastOptions, SignerOptions } from '.';

export const DEFAULT_OPTIONS: SignerOptions = {
    NODE_URL: 'https://nodes.wavesnodes.com',
    LOG_LEVEL: 'production',
};

export const DEFAULT_BROADCAST_OPTIONS: BroadcastOptions = {
    chain: false,
    confirmations: -1,
};

export const MAX_ALIAS_LENGTH = 30;

export const SMART_ASSET_EXTRA_FEE = 0.004 * Math.pow(10, 8);
