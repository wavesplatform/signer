import { EventEmitter } from 'typed-ts-events';
import { libs, signTx } from '@waves/waves-transactions';
import { NETWORK_BYTE } from './test-env';
import {
    AuthEvents,
    ConnectOptions,
    Handler,
    Provider,
    SignerTx,
    TypedData,
    UserData,
} from '../src';
import { TRANSACTION_TYPE } from '@waves/waves-transactions/dist/transactions';

export class TestProvider implements Provider {
    private options: ConnectOptions = {
        NETWORK_BYTE: NETWORK_BYTE,
        NODE_URL: 'https://nodes.wavesnodes.com',
    };
    private readonly seed: string;
    public readonly user: UserData;
    public debugEmitter: EventEmitter<TEvents> = new EventEmitter<TEvents>();
    private emitter: EventEmitter<AuthEvents> = new EventEmitter<AuthEvents>();

    constructor(seed?: string) {
        this.seed = seed || libs.crypto.randomSeed();

        this.user = {
            address: libs.crypto.address(this.seed),
            publicKey: libs.crypto.privateKey(this.seed),
        };
    }

    public on<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>,
    ): Provider {
        this.emitter.on(event, handler);
        return this;
    }

    public once<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>,
    ): Provider {
        this.emitter.once(event, handler);
        return this;
    }

    public off<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>,
    ): Provider {
        this.emitter.off(event, handler);
        return this;
    }

    public connect(options: ConnectOptions): Promise<void> {
        this.options = options;
        this.debugEmitter.trigger('connect', [options]);
        return Promise.resolve();
    }

    public login(): Promise<UserData> {
        const promise = Promise.resolve({
            address: libs.crypto.address(this.seed, this.options.NETWORK_BYTE),
            publicKey: libs.crypto.publicKey(this.seed),
        });
        this.debugEmitter.trigger('login', [] as any);
        return promise;
    }

    public logout(): Promise<void> {
        this.debugEmitter.trigger('logout', [] as any);
        return Promise.resolve();
    }

    public sign(list: Array<SignerTx>): Promise<any> {
        this.debugEmitter.trigger('sign', [list]);
        const fixAlias = (tx: any) =>
            tx.type === TRANSACTION_TYPE.ALIAS
                ? {...tx, alias: tx.alias.replace(/alias:.:/, '') }
                : tx
        return Promise.resolve(
            list.map((item) =>
                signTx(
                    fixAlias({ chainId: this.options.NETWORK_BYTE, ...item }) as any,
                    this.seed,
                ),
            ),
        ) as any;
    }

    public signMessage(data: string | number): Promise<string> {
        this.debugEmitter.trigger('signMessage', [data]);
        // TODO
        return Promise.resolve('TODO');
    }

    public signTypedData(data: Array<TypedData>): Promise<string> {
        this.debugEmitter.trigger('signTypedData', [data]);
        // TODO
        return Promise.resolve('TODO');
    }
}

type TEvents = {
    [Key in keyof Provider]: Provider[Key] extends (...args: infer A) => any
        ? A
        : never;
};
