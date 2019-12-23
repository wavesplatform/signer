import { TTransactionFromAPI, TTransactionFromAPIMap, TTransactionWithProofs } from '@waves/ts-types';
import { IAlias, IAliasWithType, IBalance, IBurn, IBurnWithType, ICancelLease, ICancelLeaseWithType, IData, IDataWithType, IExchange, IExchangeWithType, IInvoke, IInvokeWithType, IIssue, IIssueWithType, ILease, ILeaseWithType, IMassTransfer, IMassTransferWithType, IProvider, IReissue, IReissueWithType, ISetAssetScript, ISetAssetScriptWithType, ISetScript, ISetScriptWithType, ISponsorship, ISponsorshipWithType, ITransfer, ITransferWithType, ITypedData, IUserData, TActionsApi, TLong, TTransactionParamWithType } from './interface';
import { TTransactionsApi1 } from './api';
export * from './interface';
export declare class Waves {
    currentProvider: IProvider | undefined;
    private readonly _options;
    private _userData;
    private _networkBytePromise;
    private __connectPromise;
    private get _connectPromise();
    private set _connectPromise(value);
    constructor(options?: Partial<IOptions>);
    /**
     * Запросить байт сети
     */
    getNetworkByte(): Promise<number>;
    /**
     * Устанавливаем провайдер отвечающий за подпись
     * @param provider
     *
     * ```ts
     * import Waves from '@waves/waves-js';
     * import Provider from '@waves/seed-provider';
     *
     * const waves = new Waves();
     * waves.setProvider(new Provider('SEED'));
     * ```
     */
    setProvider(provider: IProvider): Promise<void>;
    /**
     * Получаем список балансов пользователя (необходимо выполнить login перед использованием)
     * Basic usage example:
     *
     * ```ts
     * await waves.getBalance(); // Возвращает балансы пользователя
     * ```
     */
    getBalance(): Promise<Array<IBalance>>;
    /**
     * Получаем информацию о пользователе
     *
     * ```ts
     * await waves.login(); // Авторизуемся. Возвращает адрес и публичный ключ
     * ```
     */
    login(): Promise<IUserData>;
    /**
     * Вылогиниваемся из юзера
     */
    logout(): Promise<void>;
    /**
     * Подписываем сообщение пользователя (провайдер может устанавливать префикс)
     * @param message
     */
    signMessage(message: string | number): Promise<string>;
    /**
     * Подписываем типизированные данные
     * @param data
     */
    signTypedData(data: Array<ITypedData>): Promise<string>;
    /**
     * Получаем список балансов в кторых можно платить комиссию
     */
    getSponsoredBalances(): Promise<Array<IBalance>>;
    batch(txOrList: TTransactionParamWithType | Array<TTransactionParamWithType>): TActionsApi<TTransactionParamWithType>;
    issue(data: IIssue): TTransactionsApi1<IIssueWithType>;
    transfer(data: ITransfer): TTransactionsApi1<ITransferWithType>;
    reissue(data: IReissue): TTransactionsApi1<IReissueWithType>;
    burn(data: IBurn): TTransactionsApi1<IBurnWithType>;
    lease(data: ILease): TTransactionsApi1<ILeaseWithType>;
    exchange(data: IExchange): TTransactionsApi1<IExchangeWithType>;
    cancelLease(data: ICancelLease): TTransactionsApi1<ICancelLeaseWithType>;
    alias(data: IAlias): TTransactionsApi1<IAliasWithType>;
    massTransfer(data: IMassTransfer): TTransactionsApi1<IMassTransferWithType>;
    data(data: IData): TTransactionsApi1<IDataWithType>;
    sponsorship(data: ISponsorship): TTransactionsApi1<ISponsorshipWithType>;
    setScript(data: ISetScript): TTransactionsApi1<ISetScriptWithType>;
    setAssetScript(data: ISetAssetScript): TTransactionsApi1<ISetAssetScriptWithType>;
    invoke(data: IInvoke): TTransactionsApi1<IInvokeWithType>;
    /**
     * Оправляем подписанную транзакцию
     * @param tx    транзакция
     * @param opt
     */
    broadcast<T extends TTransactionWithProofs<TLong>>(tx: T, opt?: Partial<IBroadcastOptions>): Promise<TTransactionFromAPIMap<TLong>[T['type']]>;
    /**
     * Отправляем массив транзакций
     * @param list
     * @param opt
     */
    broadcast(list: Array<TTransactionWithProofs<TLong>>, opt?: Partial<IBroadcastOptions>): Promise<Array<TTransactionFromAPI<TLong>>>;
    broadcast(tx: TTransactionWithProofs<TLong>, opt?: Partial<IBroadcastOptions>): Promise<TTransactionFromAPI<TLong>>;
    broadcast(list: TTransactionWithProofs<TLong> | Array<TTransactionWithProofs<TLong>>, opt?: Partial<IBroadcastOptions>): Promise<TTransactionFromAPI<TLong> | Array<TTransactionFromAPI<TLong>>>;
    /**
     * Ожидаем подтверждения транзакции
     * @param tx             транзакция
     * @param confirmations  количество подтверждений которое ожидаем
     */
    waitTxConfirm<T extends TTransactionFromAPI<TLong>>(tx: T, confirmations: number): Promise<T>;
    waitTxConfirm<T extends TTransactionFromAPI<TLong>>(tx: Array<T>, confirmations: number): Promise<Array<T>>;
    private _createPipelineAPI;
    private _createActions;
    private _sign;
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
export default Waves;
