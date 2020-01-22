import { IConnectOptions, IProvider, ITypedData, IUserData, TLong, TTransactionParamWithType, IOrder } from '../src/interface';
import { EventEmitter } from 'typed-ts-events';
import { libs, signTx } from '@waves/waves-transactions';
import { IWithId, TTransactionWithProofs } from '@waves/ts-types';
import { NETWORK_BYTE } from './_state';
import { IExchangeTransactionOrderWithProofs } from '@waves/ts-types/src';


export class TestProvider extends EventEmitter<TEvents> implements IProvider {

    private options: IConnectOptions = {
        NETWORK_BYTE: NETWORK_BYTE,
        NODE_URL: 'https://nodes.wavesplatform.com'
    };
    private readonly seed: string;


    constructor(seed?: string) {
        super();
        this.seed = seed || libs.crypto.randomSeed();
    }

    public connect(options: IConnectOptions): Promise<void> {
        this.options = options;
        this.trigger('connect', [options]);
        return Promise.resolve();
    }

    public login(): Promise<IUserData> {
        const promise = Promise.resolve({
            address: libs.crypto.address(this.seed, this.options.NETWORK_BYTE),
            publicKey: libs.crypto.publicKey(this.seed)
        });
        this.trigger('login', []);
        return promise;
    }

    public logout(): Promise<void> {
        this.trigger('logout', []);
        return Promise.resolve();
    }

    public sign(list: Array<TTransactionParamWithType>): Promise<Array<TTransactionWithProofs<TLong> & IWithId>> {
        this.trigger('sign', [list]);
        return Promise.resolve(list.map(item => signTx({ chainId: this.options.NETWORK_BYTE, ...item } as any, this.seed))) as any;
    }

    public order(data: IOrder): Promise<IExchangeTransactionOrderWithProofs<TLong>> {
        
    }

    public signMessage(data: string | number): Promise<string> {
        this.trigger('signMessage', [data]);
        // TODO
        return Promise.resolve('TODO');
    }

    public signTypedData(data: Array<ITypedData>): Promise<string> {
        this.trigger('signTypedData', [data]);
        // TODO
        return Promise.resolve('TODO');
    }
}

type TEvents = {
    [Key in keyof IProvider]: IProvider[Key] extends (...args: infer A) => any ? A : never;
}
