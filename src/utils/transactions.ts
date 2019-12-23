import { TRANSACTION_NAME_MAP, TRANSACTION_PARAM_MAP, } from '../interface';
import { NAME_MAP } from '../constants';


export function addParamType<K extends keyof TRANSACTION_PARAM_MAP>(name: K, data: Omit<TRANSACTION_PARAM_MAP[K], 'type'>): TRANSACTION_PARAM_MAP[K] {
    type TResult<K extends keyof TRANSACTION_PARAM_MAP, T extends Omit<TRANSACTION_PARAM_MAP[K], 'type'>> =
        TRANSACTION_PARAM_MAP[K] & { type: TRANSACTION_NAME_MAP[K] };

    return { ...data, type: NAME_MAP[name] } as TResult<K, Omit<TRANSACTION_PARAM_MAP[K], 'type'>>;
}
