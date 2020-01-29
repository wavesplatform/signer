import {
    TTransactionFromAPI,
    TTransactionFromAPIMap,
    TTransactionWithProofs,
} from '@waves/ts-types';
import { NAME_MAP, DEFAULT_OPTIONS } from './constants';
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
    IProvider,
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
    ITypedData,
    IUserData,
    TActionsApi,
    TLong,
    TParamsToApi,
    TParamsToSign,
    TTransactionParamWithType,
    IOrder,
    IOrderApi,
    IOffchainSignResult,
    THandler,
    IProviderStateEvents,
} from './interface';
import { evolve, toArray } from './utils';
import { checkProvider } from './utils/decorators';
import { addParamType } from './utils/transactions';
import { fetchBalanceDetails } from '@waves/node-api-js/cjs/api-node/addresses';
import { fetchAssetsBalance } from '@waves/node-api-js/cjs/api-node/assets';
import wait from '@waves/node-api-js/cjs/tools/transactions/wait';
import broadcast from '@waves/node-api-js/cjs/tools/transactions/broadcast';
import request from '@waves/node-api-js/cjs/tools/request';
import stringify from '@waves/node-api-js/cjs/tools/stringify';
import getNetworkByte from '@waves/node-api-js/cjs/tools/blocks/getNetworkByte';
import { TTransactionsApi1 } from './api';
import {
    makeConsole,
    IConsole,
    IGetMessageOptions,
    IMessage,
    IMakeOptions,
} from '@waves/client-logs';

export * from './interface';

export class Signer {
    public currentProvider: IProvider | undefined;
    private _userData: IUserData | undefined;
    private readonly _options: IOptions;
    private readonly _console: IConsole;
    private readonly _networkByte: number;

    private constructor(options: IOptions, networkByte: number) {
        this._options = options;
        this._networkByte = networkByte;

        this._console = makeConsole(
            Signer._getConsoleLogParams(options.LOG_LEVEL)
        );
        this._console.info('Success create Signer with options', this._options);
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

    public getMessages(options?: IGetMessageOptions): Array<IMessage> {
        return this._console.getMessages(options);
    }

    /**
     * Запросить байт сети
     */
    public getNetworkByte(): { networkByte: number; chainId: string } {
        return {
            networkByte: this._networkByte,
            chainId: String.fromCharCode(this._networkByte),
        };
    }

    /**
     * Устанавливаем провайдер отвечающий за подпись
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
        this._console.info('Set new Provider', provider);
        this.currentProvider = provider;

        return provider
            .connect({
                NODE_URL: this._options.NODE_URL,
                NETWORK_BYTE: this._networkByte,
            })
            .then(() => {
                this._console.info('Connect promise resolved!');
            });
    }

    /**
     * Получаем список балансов пользователя (необходимо выполнить login перед использованием)
     * Basic usage example:
     *
     * ```ts
     * await waves.getBalance(); // Возвращает балансы пользователя
     * ```
     */
    public getBalance(): Promise<Array<IBalance>> {
        if (!this._userData) {
            return Promise.reject(new Error('Need login for get balances!'));
        }
        const user = this._userData;

        return Promise.all([
            fetchBalanceDetails(this._options.NODE_URL, user.address).then(
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
            fetchAssetsBalance(this._options.NODE_URL, user.address).then(
                (data) =>
                    data.balances.map((item) => ({
                        assetId: item.assetId,
                        assetName: item.issueTransaction.name,
                        decimals: item.issueTransaction.decimals,
                        amount: String(item.balance),
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
     * Получаем информацию о пользователе
     *
     * ```ts
     * await waves.login(); // Авторизуемся. Возвращает адрес и публичный ключ
     * ```
     */
    @checkProvider
    public login(): Promise<IUserData> {
        return this.currentProvider!.login().then((data) => {
            if (!this._userData) {
                this._console.info('Add user login data', data);
                this._userData = data;
            } else {
                if (this._userData.address !== data.address) {
                    throw new Error(
                        'Ivalid provider work! Wrong change provider address!'
                    );
                }
            }

            return data;
        });
    }

    /**
     * Вылогиниваемся из юзера
     */
    @checkProvider
    public logout(): Promise<void> {
        return this.currentProvider!.logout().then(() => {
            this._console.info('Logout');
            this._userData = undefined;
        });
    }

    /**
     * Подписываем сообщение пользователя (провайдер может устанавливать префикс)
     * @param message
     */
    @checkProvider
    public signMessage(
        message: string | number
    ): Promise<IOffchainSignResult<string | number>> {
        return this.currentProvider!.signMessage(message);
    }

    /**
     * Подписываем типизированные данные
     * @param data
     */
    @checkProvider
    public signTypedData(
        data: Array<ITypedData>
    ): Promise<IOffchainSignResult<Array<ITypedData>>> {
        return this.currentProvider!.signTypedData(data);
    }

    @checkProvider
    public signBytes(
        data: Uint8Array | Array<number>
    ): Promise<IOffchainSignResult<Uint8Array | Array<number>>> {
        return this.currentProvider!.signBytes(data);
    }

    /**
     * Получаем список балансов в кторых можно платить комиссию
     */
    public getSponsoredBalances(): Promise<Array<IBalance>> {
        return this.getBalance().then((balance) =>
            balance.filter((item) => !!item.sponsorship)
        );
    }

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
    public order(data: IOrder): IOrderApi {
        const sign = () => this.currentProvider!.order(data);
        return {
            sign,
            limit: () =>
                sign().then((order) =>
                    request({
                        url: '/matcher/orderbook',
                        base: this._options.MATCHER_URL,
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
                        base: this._options.MATCHER_URL,
                        options: {
                            method: 'POST',
                            body: stringify(order),
                        },
                    })
                ),
        };
    }

    @checkProvider
    public encryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string> {
        return this.currentProvider!.decryptMessage(sharedKey, message, prefix);
    }

    @checkProvider
    public decryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string> {
        return this.currentProvider!.decryptMessage(sharedKey, message, prefix);
    }

    /**
     * Оправляем подписанную транзакцию
     * @param tx    транзакция
     * @param opt
     */
    public broadcast<T extends TTransactionWithProofs<TLong>>(
        tx: T,
        opt?: Partial<IBroadcastOptions>
    ): Promise<TTransactionFromAPIMap<TLong>[T['type']]>;
    /**
     * Отправляем массив транзакций
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
    public broadcast(
        tx:
            | TTransactionWithProofs<TLong>
            | Array<TTransactionWithProofs<TLong>>,
        opt?: Partial<IBroadcastOptions>
    ): Promise<TTransactionFromAPI<TLong> | Array<TTransactionFromAPI<TLong>>> {
        return broadcast(this._options.NODE_URL, tx as any, opt); // TODO Fix types
    }

    /**
     * Ожидаем подтверждения транзакции
     * @param tx             транзакция
     * @param confirmations  количество подтверждений которое ожидаем
     */
    public waitTxConfirm<T extends TTransactionFromAPI<TLong>>(
        tx: T,
        confirmations: number
    ): Promise<T>;
    public waitTxConfirm<T extends TTransactionFromAPI<TLong>>(
        tx: Array<T>,
        confirmations: number
    ): Promise<Array<T>>;
    public waitTxConfirm<T extends TTransactionFromAPI<TLong>>(
        tx: T | Array<T>,
        confirmations: number
    ): Promise<T | Array<T>> {
        return wait(this._options.NODE_URL, tx as any, { confirmations }); // TODO Fix types
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

    @checkProvider
    private _sign<T extends Array<TTransactionParamWithType>>(
        list: T
    ): Promise<TParamsToSign<T>> {
        return this.currentProvider!.sign(list) as any; // TODO Fix types
    }

    private static _getConsoleLogParams(
        logLevel: IOptions['LOG_LEVEL']
    ): Partial<IMakeOptions> {
        switch (logLevel) {
            case 'error':
                return {
                    namespace: 'Signer',
                    keepMessageTypes: ['warn', 'error'],
                    logMessageTypes: ['error'],
                };
            case 'production':
                return {
                    namespace: 'Signer',
                    keepMessageTypes: ['warn', 'error'],
                    logMessageTypes: [],
                };
            case 'verbose':
                return {
                    namespace: 'Signer',
                    keepMessageTypes: ['warn', 'error'],
                    logMessageTypes: ['info', 'log', 'warn', 'error'],
                };
        }
    }
}

export interface IOptions {
    /**
     * Урл ноды  с которой будет работать библиотека
     * Байт сети получаем из урла ноды (из последнего блока)
     * @default https://nodes.wavesplatform.com
     */
    NODE_URL: string;
    /**
     * Урл матчера (временно не поддерживается)
     */
    MATCHER_URL: string;
    /**
     *
     */
    LOG_LEVEL: 'production' | 'error' | 'verbose';
}

export interface IBroadcastOptions {
    /**
     * Оправлять транзакции после попадания предыдущей в блокчейн
     */
    chain: boolean;
    /**
     * Количество подтверждений после которого будет резолвится промис (для всех транзакций)
     */
    confirmations: number;
}

export default Signer;
