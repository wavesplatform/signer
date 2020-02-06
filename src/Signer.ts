import {
    IConsole,
    IGetMessageOptions,
    IMessage,
    makeConsole,
    makeOptions,
} from '@waves/client-logs';
import { fetchBalanceDetails } from '@waves/node-api-js/cjs/api-node/addresses';
import { fetchAssetsBalance } from '@waves/node-api-js/cjs/api-node/assets';
import getNetworkByte from '@waves/node-api-js/cjs/tools/blocks/getNetworkByte';
import request from '@waves/node-api-js/cjs/tools/request';
import stringify from '@waves/node-api-js/cjs/tools/stringify';
import broadcast from '@waves/node-api-js/cjs/tools/transactions/broadcast';
import wait from '@waves/node-api-js/cjs/tools/transactions/wait';
import {
    TTransactionFromAPI,
    TTransactionFromAPIMap,
    TTransactionWithProofs,
    IExchangeTransactionOrderWithProofs,
} from '@waves/ts-types';
import { TTransactionsApi1 } from './api';
import { NAME_MAP } from './constants';
import { ERROR_CODE_MAP, SignerError } from './errors/SignerError';
import {
    IAlias,
    IAliasWithType,
    IBalance,
    IBurn,
    IBurnWithType,
    ICancelLease,
    ICancelLeaseWithType,
    IData,
    IDataWithType,
    IExchange,
    IExchangeWithType,
    IInvoke,
    IInvokeWithType,
    IIssue,
    IIssueWithType,
    ILease,
    ILeaseWithType,
    IMassTransfer,
    IMassTransferWithType,
    IOffchainSignResult,
    IOrder,
    IOrderApi,
    IProvider,
    IProviderStateEvents,
    IReissue,
    IReissueWithType,
    ISetAssetScript,
    ISetAssetScriptWithType,
    ISetScript,
    ISetScriptWithType,
    ISponsorship,
    ISponsorshipWithType,
    ITransfer,
    ITransferWithType,
    IUserData,
    TActionsApi,
    THandler,
    TLong,
    TParamsToApi,
    TParamsToSign,
    TTransactionParamWithType,
} from './interface';
import { evolve, toArray } from './utils';
import {
    catchNetworkErrors,
    checkAuth,
    checkProvider,
    catchProviderError,
} from './utils/decorators';
import { addParamType } from './utils/transactions';

export * from './interface';

export class Signer {
    public currentProvider: IProvider | undefined;
    public readonly options: IOptions;
    private readonly _console: IConsole;
    private readonly _networkBytePromise: Promise<number>;

    constructor(options: IOptions) {
        if (!options.NODE_URL) {
            throw new SignerError(
                ERROR_CODE_MAP.WRONG_SIGNER_PARAMS,
                'NODE_URL'
            );
        }

        this.options = options;
        this._networkBytePromise = getNetworkByte(this.options.NODE_URL).catch(
            (e) => {
                const error = new SignerError(
                    ERROR_CODE_MAP.NETWORK_BYTE_ERROR,
                    {
                        node: this.options.NODE_URL,
                        error: e.message as string,
                    }
                );

                this._console.error(error);
                return Promise.reject(error);
            }
        );

        this._console = makeConsole(
            makeOptions(options.LOG_LEVEL ?? 'production', 'Signer')
        );
        this._console.info('Success create Signer with options', this.options);
    }

    @checkProvider
    public on<EVENT extends keyof IProviderStateEvents>(
        event: EVENT,
        hander: THandler<IProviderStateEvents[EVENT]>
    ): Signer {
        this._console.info(`Add handler for "${event}"`);
        this.currentProvider!.on(event, hander);
        return this;
    }

    @checkProvider
    public once<EVENT extends keyof IProviderStateEvents>(
        event: EVENT,
        hander: THandler<IProviderStateEvents[EVENT]>
    ): Signer {
        this._console.info(`Add once handler for "${event}"`);
        this.currentProvider!.once(event, hander);
        return this;
    }

    @checkProvider
    public off<EVENT extends keyof IProviderStateEvents>(
        event: EVENT,
        hander: THandler<IProviderStateEvents[EVENT]>
    ): Signer {
        this._console.info(`Remove handler for "${event}"`);
        this.currentProvider!.off(event, hander);
        return this;
    }

    @checkProvider
    @catchProviderError
    public auth(
        expirationDate: Date | number
    ): Promise<IOffchainSignResult<string>> {
        const now = Date.now();
        const expiration =
            expirationDate instanceof Date
                ? expirationDate.getTime()
                : expirationDate;

        if (expiration < now) {
            return Promise.reject(
                new SignerError(ERROR_CODE_MAP.WRONG_AUTH_PARAMS, void 0)
            );
        }

        return this.currentProvider!.auth(expiration, location.hostname);
    }

    public getMessages(options?: IGetMessageOptions): Array<IMessage> {
        return this._console.getMessages(options);
    }

    /**
     * Get network byte
     */
    public getNetworkByte(): Promise<{ networkByte: number; chainId: string }> {
        return this._networkBytePromise.then((byte) => ({
            networkByte: byte,
            chainId: String.fromCharCode(byte),
        }));
    }

    /**
     * Set the provider for sign
     * @param provider
     *
     * ```ts
     * import Signer from '@waves/signer';
     * import Provider from '@waves/seed-provider';
     *
     * const waves = new Signer();
     * waves.setProvider(new Provider('SEED'));
     * ```
     */
    public setProvider(provider: IProvider): Promise<void> {
        Signer._checkProviderInterface(provider);
        this._console.info('Set new Provider', provider);
        this.currentProvider = provider;

        provider.on('onLogin', (user) => {
            this._console.info('User login succesifyl!', user);
        });

        provider.on('onLogout', () => {
            this._console.info('User logout!');
        });

        return this._networkBytePromise
            .then((networkByte) =>
                provider.connect({
                    NODE_URL: this.options.NODE_URL,
                    NETWORK_BYTE: networkByte,
                })
            )
            .then(() => {
                this._console.info('Connect promise resolved!');
            })
            .catch(() => {
                const error = new SignerError(
                    ERROR_CODE_MAP.PROVIDER_CONNECT,
                    void 0
                );
                this._console.error(error);
                return Promise.reject(error);
            });
    }

    /**
     * Get list of user balances (login method is required before)
     * Basic usage example:
     *
     * ```ts
     * await waves.getBalance(); // returns user balances
     * ```
     */
    @checkProvider
    @checkAuth
    @catchNetworkErrors({ requestName: 'user balances' })
    public getBalance(): Promise<Array<IBalance>> {
        const user = this.currentProvider!.state.activeUser!;

        return Promise.all([
            fetchBalanceDetails(this.options.NODE_URL, user.address).then(
                (data) => ({
                    assetId: 'WAVES',
                    assetName: 'Waves',
                    decimals: 8,
                    amount: String(data.available),
                    isMyAsset: false,
                    tokens: Number(data.available) * Math.pow(10, 8),
                    sponsorship: null,
                    isSmart: false,
                })
            ),
            fetchAssetsBalance(this.options.NODE_URL, user.address).then(
                (data) =>
                    data.balances.map((item) => ({
                        assetId: item.assetId,
                        assetName: item.issueTransaction.name,
                        decimals: item.issueTransaction.decimals,
                        amount: item.balance,
                        isMyAsset:
                            item.issueTransaction.sender === user.address,
                        tokens:
                            item.balance *
                            Math.pow(10, item.issueTransaction.decimals),
                        isSmart: !!item.issueTransaction.script,
                        sponsorship:
                            item.sponsorBalance != null &&
                            item.sponsorBalance > Math.pow(10, 8) &&
                            (item.minSponsoredAssetFee || 0) < item.balance
                                ? item.minSponsoredAssetFee
                                : null,
                    }))
            ),
        ]).then(([waves, assets]) => [waves, ...assets]);
    }

    /**
     * Get user data (address and public key)
     *
     * ```ts
     * await waves.login(); // returns the addres and public key
     * ```
     */
    @checkProvider
    @catchProviderError
    public login(): Promise<IUserData> {
        return this.currentProvider!.login();
    }

    /**
     * User logout
     */
    @checkProvider
    @catchProviderError
    public logout(): Promise<void> {
        return this.currentProvider!.logout();
    }

    /**
     * Sign the message (provider can add the some prefix of your message for more sequrity)
     * @param message
     */
    @checkProvider
    @catchProviderError
    public signMessage(
        message: string | number
    ): Promise<IOffchainSignResult<string | number>> {
        return this.currentProvider!.signMessage(message);
    }

    /**
     * Get list of sponsorship balances
     */
    public getSponsoredBalances(): Promise<Array<IBalance>> {
        return this.getBalance().then((balance) =>
            balance.filter((item) => !!item.sponsorship)
        );
    }

    // TODO!!!!
    public batch(
        txOrList: TTransactionParamWithType | Array<TTransactionParamWithType>
    ): TActionsApi<TTransactionParamWithType> {
        const isOnce = !Array.isArray(txOrList);
        const sign = () =>
            this._sign(toArray(txOrList)).then((result) =>
                isOnce ? result[0] : result
            ) as any;
        return {
            sign,
            broadcast: (opt?: Partial<IBroadcastOptions>) =>
                sign().then((transactions: any) =>
                    this.broadcast(transactions, opt)
                ),
        };
    }

    public issue(data: IIssue): TTransactionsApi1<IIssueWithType> {
        return this._createPipelineAPI([addParamType('issue', data)]);
    }

    public transfer(data: ITransfer): TTransactionsApi1<ITransferWithType> {
        return this._createPipelineAPI([addParamType('transfer', data)]);
    }

    public reissue(data: IReissue): TTransactionsApi1<IReissueWithType> {
        return this._createPipelineAPI([addParamType('reissue', data)]);
    }

    public burn(data: IBurn): TTransactionsApi1<IBurnWithType> {
        return this._createPipelineAPI([addParamType('burn', data)]);
    }

    public lease(data: ILease): TTransactionsApi1<ILeaseWithType> {
        return this._createPipelineAPI([addParamType('lease', data)]);
    }

    public exchange(data: IExchange): TTransactionsApi1<IExchangeWithType> {
        return this._createPipelineAPI([addParamType('exchange', data)]);
    }

    public cancelLease(
        data: ICancelLease
    ): TTransactionsApi1<ICancelLeaseWithType> {
        return this._createPipelineAPI([addParamType('cancelLease', data)]);
    }

    public alias(data: IAlias): TTransactionsApi1<IAliasWithType> {
        return this._createPipelineAPI([addParamType('alias', data)]);
    }

    public massTransfer(
        data: IMassTransfer
    ): TTransactionsApi1<IMassTransferWithType> {
        return this._createPipelineAPI([addParamType('massTransfer', data)]);
    }

    public data(data: IData): TTransactionsApi1<IDataWithType> {
        return this._createPipelineAPI([addParamType('data', data)]);
    }

    public sponsorship(
        data: ISponsorship
    ): TTransactionsApi1<ISponsorshipWithType> {
        return this._createPipelineAPI([addParamType('sponsorship', data)]);
    }

    public setScript(data: ISetScript): TTransactionsApi1<ISetScriptWithType> {
        return this._createPipelineAPI([addParamType('setScript', data)]);
    }

    public setAssetScript(
        data: ISetAssetScript
    ): TTransactionsApi1<ISetAssetScriptWithType> {
        return this._createPipelineAPI([addParamType('setAssetScript', data)]);
    }

    public invoke(data: IInvoke): TTransactionsApi1<IInvokeWithType> {
        return this._createPipelineAPI([addParamType('invoke', data)]);
    }

    @checkProvider
    @catchNetworkErrors({ requestName: 'set orider' })
    public order(data: IOrder): IOrderApi {
        if (!this.options.MATCHER_URL) {
            throw new SignerError(
                ERROR_CODE_MAP.NO_MATCHER_URL_PROVIDED,
                void 0
            );
        }

        const sign = () => this._signOrder(data);
        return {
            sign,
            limit: () =>
                sign().then((order) =>
                    request({
                        url: '/matcher/orderbook',
                        base: this.options!.MATCHER_URL as string,
                        options: {
                            method: 'POST',
                            body: stringify(order),
                        },
                    })
                ),
            market: () =>
                sign().then((order) =>
                    request({
                        url: '/matcher/orderbook/market',
                        base: this.options!.MATCHER_URL as string,
                        options: {
                            method: 'POST',
                            body: stringify(order),
                        },
                    })
                ),
        };
    }

    @checkProvider
    @catchProviderError
    public encryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string> {
        return this.currentProvider!.decryptMessage(sharedKey, message, prefix);
    }

    @checkProvider
    @catchProviderError
    public decryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string> {
        return this.currentProvider!.decryptMessage(sharedKey, message, prefix);
    }

    /**
     * Send the signet transaction to node
     * @param tx  transaction
     * @param opt
     */
    public broadcast<T extends TTransactionWithProofs<TLong>>(
        tx: T,
        opt?: Partial<IBroadcastOptions>
    ): Promise<TTransactionFromAPIMap<TLong>[T['type']]>;
    /**
     * Send the list of transaction to node
     * @param list
     * @param opt
     */
    public broadcast(
        list: Array<TTransactionWithProofs<TLong>>,
        opt?: Partial<IBroadcastOptions>
    ): Promise<Array<TTransactionFromAPI<TLong>>>;
    public broadcast(
        tx: TTransactionWithProofs<TLong>,
        opt?: Partial<IBroadcastOptions>
    ): Promise<TTransactionFromAPI<TLong>>;
    public broadcast(
        list:
            | TTransactionWithProofs<TLong>
            | Array<TTransactionWithProofs<TLong>>,
        opt?: Partial<IBroadcastOptions>
    ): Promise<TTransactionFromAPI<TLong> | Array<TTransactionFromAPI<TLong>>>;
    @catchNetworkErrors({ requestName: 'broadcast transaction' })
    public broadcast(
        tx:
            | TTransactionWithProofs<TLong>
            | Array<TTransactionWithProofs<TLong>>,
        opt?: Partial<IBroadcastOptions>
    ): Promise<TTransactionFromAPI<TLong> | Array<TTransactionFromAPI<TLong>>> {
        return broadcast(this.options.NODE_URL, tx as any, opt); // TODO Fix types
    }

    /**
     * Waiting for confirmation of transaction
     * When transaction is added to blockchain and 
     * difference betwin transaction height and 
     * block height will be equal to 'confirmations' property
     * @param tx             transaction
     * @param confirmations  count of confirmations from node
     */
    public waitTxConfirm<T extends TTransactionFromAPI<TLong>>(
        tx: T,
        confirmations: number
    ): Promise<T>;
    public waitTxConfirm<T extends TTransactionFromAPI<TLong>>(
        tx: Array<T>,
        confirmations: number
    ): Promise<Array<T>>;
    @catchNetworkErrors({ requestName: 'wait transaction transaction' })
    public waitTxConfirm<T extends TTransactionFromAPI<TLong>>(
        tx: T | Array<T>,
        confirmations: number
    ): Promise<T | Array<T>> {
        return wait(this.options.NODE_URL, tx as any, { confirmations }); // TODO Fix types
    }

    @catchProviderError
    private _signOrder(
        order: IOrder
    ): Promise<IExchangeTransactionOrderWithProofs<TLong>> {
        return this.currentProvider!.order(order);
    }

    private _createPipelineAPI(list: any): any {
        // TODO fix types
        const api = evolve(NAME_MAP, (key, type) => {
            return (data: any) =>
                this._createPipelineAPI([...list, { type: type, ...data }]);
        });

        return {
            ...api,
            ...this._createActions(list),
        };
    }

    private _createActions<T extends Array<TTransactionParamWithType>>(
        list: T
    ): TActionsApi<T> {
        const sign = () => this._sign(list);
        const broadcast = (
            options?: IBroadcastOptions
        ): Promise<TParamsToApi<T>> =>
            sign().then(
                (list) =>
                    this.broadcast(list, options) as Promise<TParamsToApi<T>>
            );
        return { sign, broadcast };
    }

    @catchProviderError
    private _sign<T extends Array<TTransactionParamWithType>>(
        list: T
    ): Promise<TParamsToSign<T>> {
        return this.currentProvider!.sign(list) as any; // TODO Fix types
    }

    private static _checkProviderInterface(provider: IProvider): void {
        [
            'state' as keyof IProvider,
            'repositoryUrl' as keyof IProvider,
            'on' as keyof IProvider,
            'once' as keyof IProvider,
            'off' as keyof IProvider,
            'connect' as keyof IProvider,
            'login' as keyof IProvider,
            'logout' as keyof IProvider,
            'signMessage' as keyof IProvider,
            'signTypedData' as keyof IProvider,
            'signBytes' as keyof IProvider,
            'order' as keyof IProvider,
            'encryptMessage' as keyof IProvider,
            'decryptMessage' as keyof IProvider,
            'sign' as keyof IProvider,
        ].forEach((property) => {
            if (typeof provider[property] !== 'function') {
                throw new SignerError(ERROR_CODE_MAP.PROVIDER_INTERFACE_ERROR, {
                    property,
                    provider,
                });
            }
        });
    }
}

export interface IOptions {
    /**
     * Node url
     * Network byte getting from node (from last block)
     */
    NODE_URL: string;
    /**
     * Matcher url
     */
    MATCHER_URL?: string | undefined;
    /**
     * Level of logging signer actions
     */
    LOG_LEVEL?: 'production' | 'error' | 'verbose';
}

export interface IBroadcastOptions {
    /**
     * If the chain parameter is true, then transactions will be sent one after another
     */
    chain: boolean;
    /**
     * Count of confirmations from node (for all of transactions)
     */
    confirmations: number;
}

export default Signer;
