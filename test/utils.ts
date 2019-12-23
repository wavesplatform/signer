import { TTransactionFromAPI } from '@waves/ts-types';
import { TLong } from '../src/interface';
import { waitForTx } from '@waves/waves-transactions';
import { NODE_URL } from './_state';

export const wait = (tx: TTransactionFromAPI<TLong>) => waitForTx(tx.id, { apiBase: NODE_URL })
    .then(() => tx);

export const waitTime = (time: number) => new Promise(resolve => setTimeout(resolve, time));