import { TRANSACTION_PARAM_MAP } from '../interface';
export declare function addParamType<K extends keyof TRANSACTION_PARAM_MAP>(name: K, data: Omit<TRANSACTION_PARAM_MAP[K], 'type'>): TRANSACTION_PARAM_MAP[K];
