import { IWithId, TTransactionWithProofs } from '@waves/ts-types';
import { IExchangeTransactionOrderWithProofs } from '@waves/ts-types/src';
import { libs, order, signTx } from '@waves/waves-transactions';
import { EventEmitter } from 'typed-ts-events';
import {
    IConnectOptions,
    IOffchainSignResult,
    IOrder,
    IProvider,
    IProviderStateEvents,
    ITypedData,
    IUserData,
    TLong,
    TProviderState,
    TTransactionParamWithType,
} from '../src/interface';
import { NETWORK_BYTE } from './_state';

type TEvents = {
    [Key in keyof Omit<
        IProvider,
        'on' | 'once' | 'off'
    >]: IProvider[Key] extends (...args: infer A) => any ? A : never;
};

export class TestProvider extends EventEmitter<TEvents & IProviderStateEvents>
    implements IProvider {
    public state: TProviderState = {
        logined: false,
        activeUser: null,
    };

    private options: IConnectOptions = {
        NETWORK_BYTE: NETWORK_BYTE,
        NODE_URL: 'https://nodes.wavesplatform.com',
    };
    private readonly seed: string;

    constructor(seed?: string) {
        super();
        this.seed = seed || libs.crypto.randomSeed();
    }

    public on(event: any, handler: any): any {
        return super.on(event, handler);
    }

    public once(event: any, handler: any): any {
        return super.once(event, handler);
    }

    public off(event?: any, handler?: any): any {
        return super.off(event, handler);
    }

    public connect(options: IConnectOptions): Promise<void> {
        this.options = options;
        this.trigger('connect', [options]);
        return Promise.resolve();
    }

    public login(): Promise<IUserData> {
        const promise = Promise.resolve({
            address: libs.crypto.address(this.seed, this.options.NETWORK_BYTE),
            publicKey: libs.crypto.publicKey(this.seed),
        });
        this.trigger('login', []);
        return promise;
    }

    public logout(): Promise<void> {
        this.trigger('logout', []);
        return Promise.resolve();
    }

    public sign(
        list: Array<TTransactionParamWithType>
    ): Promise<Array<TTransactionWithProofs<TLong> & IWithId>> {
        this.trigger('sign', [list]);
        return Promise.resolve(
            list.map((item) =>
                signTx(
                    {
                        chainId: this.options.NETWORK_BYTE,
                        ...item,
                    } as any,
                    this.seed
                )
            )
        ) as any;
    }

    public order(
        data: IOrder
    ): Promise<IExchangeTransactionOrderWithProofs<TLong>> {
        return Promise.resolve(order(data, this.seed)) as any;
    }

    public signMessage(
        data: string | number
    ): Promise<IOffchainSignResult<string | number>> {
        this.trigger('signMessage', [data]);
        // TODO
        return Promise.resolve({
            signature: 'TODO',
            signedData: data,
        });
    }

    public signTypedData(
        data: Array<ITypedData>
    ): Promise<IOffchainSignResult<Array<ITypedData>>> {
        this.trigger('signTypedData', [data]);
        // TODO
        return Promise.resolve({
            signature: 'TODO',
            signedData: data,
        });
    }

    public signBytes(
        data: Uint8Array | Array<number>
    ): Promise<IOffchainSignResult<Uint8Array | Array<number>>> {
        this.trigger('signBytes', [data]);
        // TODO
        return Promise.resolve({
            signature: 'TODO',
            signedData: data,
        });
    }

    public encryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string> {
        this.trigger('encryptMessage', [sharedKey, message, prefix]);
        return Promise.resolve('TODO');
    }

    public decryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string> {
        this.trigger('decryptMessage', [sharedKey, message, prefix]);
        return Promise.resolve('TODO');
    }
}
