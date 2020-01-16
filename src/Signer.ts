import {
    TTransactionFromAPI,
    TTransactionFromAPIMap,
    TTransactionWithProofs,
} from '@waves/ts-types';
import { DEFAULT_OPTIONS, NAME_MAP } from './constants';
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
} from './interface';
import { evolve, toArray } from './utils';
import { addParamType } from './utils/transactions';
import { fetchBalanceDetails } from '@waves/node-api-js/cjs/api-node/addresses';
import { fetchAssetsBalance } from '@waves/node-api-js/cjs/api-node/assets';
import wait from '@waves/node-api-js/cjs/tools/transactions/wait';
import broadcast from '@waves/node-api-js/cjs/tools/transactions/broadcast';
import getNetworkByte from '@waves/node-api-js/cjs/tools/blocks/getNetworkByte';
import { TTransactionsApi1 } from './api';

export * from './interface';

export class Signer {
    public currentProvider: IProvider | undefined;
    private readonly _options: IOptions;
    private _userData: IUserData | undefined;
    private _networkBytePromise: Promise<number>;
    private __connectPromise: Promise<IProvider> | undefined;

    private get _connectPromise(): Promise<IProvider> {
        return this.__connectPromise || Promise.reject('Has no provider!');
    }

    private set _connectPromise(promise: Promise<IProvider>) {
        this.__connectPromise = promise;
    }

    constructor(options?: Partial<IOptions>) {
        this._options = { ...DEFAULT_OPTIONS, ...(options || {}) };
        this._networkBytePromise = getNetworkByte(this._options.NODE_URL).then(
            (byte) => {
                return byte;
            }
        );
    }

    /**
     * Запросить байт сети
     */
    public getNetworkByte(): Promise<number> {
        return this._networkBytePromise;
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
        this.currentProvider = provider;

        const result = this._networkBytePromise.then((networkByte) =>
            provider.connect({
                NODE_URL: this._options.NODE_URL,
                NETWORK_BYTE: networkByte,
            })
        );

        this._connectPromise = result.then(() => provider);

        return result;
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
            fetchBalanceDetails(this._options.NODE_URL, user.address)
                .then(data => ({
                    assetId: 'WAVES',
                    assetName: 'Waves',
                    decimals: 8,
                    amount: String(data.available),
                    isMyAsset: false,
                    tokens: Number(data.available) * Math.pow(10, 8),
                    sponsorship: null,
                    isSmart: false
                })),
            fetchAssetsBalance(this._options.NODE_URL, user.address)
                .then((data) => data.balances.map((item) => ({
                    assetId: item.assetId,
                    assetName: item.issueTransaction.name,
                    decimals: item.issueTransaction.decimals,
                    amount: String(item.balance),
                    isMyAsset: item.issueTransaction.sender === user.address,
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
    public login(): Promise<IUserData> {
        return this._connectPromise
            .then((provider) => provider.login())
            .then((data) => {
                this._userData = data;
                return data;
            });
    }

    /**
     * Вылогиниваемся из юзера
     */
    public logout(): Promise<void> {
        return this._connectPromise
            .then((provider) => provider.logout())
            .then(() => {
                this._userData = undefined;
            });
    }

    /**
     * Подписываем сообщение пользователя (провайдер может устанавливать префикс)
     * @param message
     */
    public signMessage(message: string | number): Promise<string> {
        return this._connectPromise.then((provider) =>
            provider.signMessage(message)
        );
    }

    /**
     * Подписываем типизированные данные
     * @param data
     */
    public signTypedData(data: Array<ITypedData>): Promise<string> {
        return this._connectPromise.then((provider) =>
            provider.signTypedData(data)
        );
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

    private _sign<T extends Array<TTransactionParamWithType>>(
        list: T
    ): Promise<TParamsToSign<T>> {
        return this._connectPromise.then((provider) =>
            provider.sign(list)
        ) as any;
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
