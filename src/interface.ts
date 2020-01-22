import {
    IMassTransferItem,
    IWithId,
    TBase64Script,
    TTransactionFromAPIMap,
    TTransactionWithProofs,
    TTransactionWithProofsMap,
    TInvokeScriptCallArgument,
} from '@waves/ts-types';
import {
    IExchangeTransactionOrder,
    IWithProofs,
    IExchangeTransactionOrderWithProofs,
} from '@waves/ts-types/src/parts';
import { IBroadcastOptions } from './Signer';

export type TLong = string | number;

export type TRANSACTION_TYPE_MAP = {
    3: 'issue';
    4: 'transfer';
    5: 'reissue';
    6: 'burn';
    7: 'exchange';
    8: 'lease';
    9: 'cancelLease';
    10: 'alias';
    11: 'massTransfer';
    12: 'data';
    13: 'setScript';
    14: 'sponsorship';
    15: 'setAssetScript';
    16: 'invoke';
};

export type TRANSACTION_NAME_MAP = {
    issue: 3;
    transfer: 4;
    reissue: 5;
    burn: 6;
    exchange: 7;
    lease: 8;
    cancelLease: 9;
    alias: 10;
    massTransfer: 11;
    data: 12;
    setScript: 13;
    sponsorship: 14;
    setAssetScript: 15;
    invoke: 16;
};
export type TRANSACTION_PARAM_MAP = {
    issue: IIssueWithType;
    transfer: ITransferWithType;
    reissue: IReissueWithType;
    burn: IBurnWithType;
    exchange: IExchangeWithType;
    lease: ILeaseWithType;
    cancelLease: ICancelLeaseWithType;
    alias: IAliasWithType;
    massTransfer: IMassTransferWithType;
    data: IDataWithType;
    setScript: ISetScriptWithType;
    sponsorship: ISponsorshipWithType;
    setAssetScript: ISetAssetScriptWithType;
    invoke: IInvokeWithType;
};

export interface IIssueWithType<LONG = TLong> extends IIssue<LONG> {
    type: TRANSACTION_NAME_MAP['issue'];
}

export interface ITransferWithType<LONG = TLong> extends ITransfer<LONG> {
    type: TRANSACTION_NAME_MAP['transfer'];
}

export interface IReissueWithType<LONG = TLong> extends IReissue<LONG> {
    type: TRANSACTION_NAME_MAP['reissue'];
}

export interface IBurnWithType<LONG = TLong> extends IBurn<LONG> {
    type: TRANSACTION_NAME_MAP['burn'];
}

export interface ILeaseWithType<LONG = TLong> extends ILease<LONG> {
    type: TRANSACTION_NAME_MAP['lease'];
}

export interface ICancelLeaseWithType<LONG = TLong> extends ICancelLease<LONG> {
    type: TRANSACTION_NAME_MAP['cancelLease'];
}

export interface IAliasWithType<LONG = TLong> extends IAlias<LONG> {
    type: TRANSACTION_NAME_MAP['alias'];
}

export interface IMassTransferWithType<LONG = TLong>
    extends IMassTransfer<LONG> {
    type: TRANSACTION_NAME_MAP['massTransfer'];
}

export interface IDataWithType<LONG = TLong> extends IData<LONG> {
    type: TRANSACTION_NAME_MAP['data'];
}

export interface ISetScriptWithType<LONG = TLong> extends ISetScript<LONG> {
    type: TRANSACTION_NAME_MAP['setScript'];
}

export interface ISponsorshipWithType<LONG = TLong> extends ISponsorship<LONG> {
    type: TRANSACTION_NAME_MAP['sponsorship'];
}

export interface IExchangeWithType<LONG = TLong> extends IExchange<LONG> {
    type: TRANSACTION_NAME_MAP['exchange'];
}

export interface ISetAssetScriptWithType<LONG = TLong>
    extends ISetAssetScript<LONG> {
    type: TRANSACTION_NAME_MAP['setAssetScript'];
}

export interface IInvokeWithType<LONG = TLong> extends IInvoke<LONG> {
    type: TRANSACTION_NAME_MAP['invoke'];
}

export interface IOrder<LONG = TLong> {
    matcherPublicKey: string;
    price: LONG;
    amount: LONG;
    orderType: 'buy' | 'sell';
    amountAsset: string | null;
    priceAsset: string | null;
    senderPublicKey?: string;
    matcherFee?: number;
    timestamp?: number;
    expiration?: number;
    matcherFeeAssetId?: string | null;
}

export type TTransactionParamWithType<LONG = TLong> =
    | IIssueWithType<LONG>
    | ITransferWithType<LONG>
    | IReissueWithType<LONG>
    | IBurnWithType<LONG>
    | ILeaseWithType<LONG>
    | ICancelLeaseWithType<LONG>
    | IAliasWithType<LONG>
    | IMassTransferWithType<LONG>
    | IDataWithType<LONG>
    | ISetScriptWithType<LONG>
    | ISponsorshipWithType<LONG>
    | IExchangeWithType<LONG>
    | ISetAssetScriptWithType<LONG>
    | IInvokeWithType<LONG>;

export type TTransactionParam<LONG = TLong> =
    | IIssue<LONG>
    | ITransfer<LONG>
    | IReissue<LONG>
    | IBurn<LONG>
    | ILease<LONG>
    | ICancelLease<LONG>
    | IAlias<LONG>
    | IMassTransfer<LONG>
    | IData<LONG>
    | ISetScript<LONG>
    | ISponsorship<LONG>
    | IExchange<LONG>
    | ISetAssetScript<LONG>
    | IInvoke<LONG>;

export interface IUserData {
    /**
     * Адрес пользователя
     */
    address: string;
    /**
     * Публичный ключ
     */
    publicKey: string;
}

export interface ITypedData {
    /**
     * Тип поля
     */
    type: 'string' | 'integer' | 'boolean' | 'binary';
    /**
     * Наименование поля
     */
    key: string;
    /**
     * Значение
     */
    value: string | number | boolean;
}

export interface ITXBase<LONG = TLong> {
    fee?: LONG;
    proofs?: Array<string>;
    senderPublicKey?: string;
}

export interface IIssue<LONG = TLong> extends ITXBase<LONG> {
    name: string;
    decimals: number;
    quantity: LONG;
    reissuable: boolean;
    description: string;
    chainId?: number;
    script?: string;
}

export interface ITransfer<LONG = TLong> extends ITXBase<LONG> {
    recipient: string;
    amount: LONG;
    assetId?: string;
    attachment?: string;
    feeAssetId?: string;
}

export interface IReissue<LONG = TLong> extends ITXBase<LONG> {
    assetId: string;
    quantity: LONG;
    reissuable: boolean;
    chainId?: number;
}

export interface IBurn<LONG = TLong> extends ITXBase<LONG> {
    assetId: string;
    quantity: LONG;
    chainId?: number;
}

export interface ILease<LONG = TLong> extends ITXBase<LONG> {
    amount: LONG;
    recipient: string;
}

export interface ICancelLease<LONG = TLong> extends ITXBase<LONG> {
    leaseId: string;
    chainId?: number;
}

export interface IAlias<LONG = TLong> extends ITXBase<LONG> {
    alias: string;
    chainId?: number;
}

export interface IMassTransfer<LONG = TLong> extends ITXBase<LONG> {
    assetId?: string;
    transfers: Array<IMassTransferItem<LONG>>;
    attachment?: string;
}

export interface IData<LONG = TLong> extends ITXBase<LONG> {
    data: Array<IDataEntry | ITypelessDataEntry>;
}

export interface ISetScript<LONG = TLong> extends ITXBase<LONG> {
    script: TBase64Script | null;
    chainId?: number;
}

export interface ISponsorship<LONG = TLong> extends ITXBase<LONG> {
    assetId: string;
    minSponsoredAssetFee: LONG;
}

export interface IExchange<LONG = TLong> extends ITXBase<LONG> {
    buyOrder: IExchangeTransactionOrder<LONG> & IWithProofs;
    sellOrder: IExchangeTransactionOrder<LONG> & IWithProofs;
    price: LONG;
    amount: LONG;
    buyMatcherFee: LONG;
    sellMatcherFee: LONG;
}

export interface ISetAssetScript<LONG = TLong> extends ITXBase<LONG> {
    chainId?: number;
    assetId: string;
    script: TBase64Script;
}

export interface IInvoke<LONG = TLong> extends ITXBase<LONG> {
    dApp: string;
    payment?: Array<IMoney>;
    call?: ICall;
    chainId?: number;
}

export interface IDataEntry {
    key: string;
    type: 'string' | 'integer' | 'binary' | 'boolean';
    value: string | number | boolean | Uint8Array | Array<number>;
}

export interface IOffchainSignResult<T> {
    signedData: T;
    signature: string;
}

export interface ITypelessDataEntry {
    key: string;
    value: string | number | boolean | Uint8Array | number[];
}

export interface IMoney<LONG = TLong> {
    assetId: string;
    amount: LONG;
}

export interface ICall {
    /**
     * function name
     */
    function: string;
    /**
     * array
     */
    args: Array<TInvokeScriptCallArgument<TLong>>;
}

export interface IBalance<LONG = TLong> extends IAssetInfo {
    /**
     * Количество денег на балансе
     * Возвращается в минимальных неделимых частях
     * Например 1 WAVES = 100000000 в данном АПИ
     */
    amount: LONG;
    /**
     * Количество денег на балансе
     * Возвращается в токенах (данные из АПИ умноженные на 10 в степени decimals)
     */
    tokens: LONG;
    /**
     * Если поле есть то в нём содержится курс для оплаты комиссии (к 0.001 WAVES)
     */
    sponsorship?: LONG | null;
}

export interface IAssetInfo {
    /**
     * ID ассета
     */
    assetId: string;
    /**
     * Название ассета
     */
    assetName: string;
    /**
     * Количество знаков после запятой у ассета
     */
    decimals: number;
    /**
     * Выпущен авторизованным пользователем
     */
    isMyAsset: boolean;
    /**
     * Является ли ассет скриптованным
     */
    isSmart: boolean;
}

export interface IOrderApi {
    sign(): Promise<IExchangeTransactionOrderWithProofs<TLong>>;
    limit(): Promise<IExchangeTransactionOrderWithProofs<TLong>>;
    market(): Promise<IExchangeTransactionOrderWithProofs<TLong>>;
}

export type TProviderState = IProviderState | IProviderStateLogined;

export interface IProviderState {
    logined: false;
    activeUser: null;
}

export interface IProviderStateLogined {
    logined: true;
    activeUser: IUserData;
}

export interface IProviderStateEvents {
    onLogin: IUserData;
    onLogout: void;
}

export type THandler<T> = (data: T) => any;

export interface IProvider {
    state: TProviderState;

    on<EVENT extends keyof IProviderStateEvents>(
        event: EVENT,
        handler: THandler<IProviderStateEvents[EVENT]>
    ): IProvider;

    once<EVENT extends keyof IProviderStateEvents>(
        event: EVENT,
        handler: THandler<IProviderStateEvents[EVENT]>
    ): IProvider;

    off<EVENT extends keyof IProviderStateEvents>(
        event: EVENT,
        handler: THandler<IProviderStateEvents[EVENT]>
    ): IProvider;

    /**
     * Подключаем провайдер к настройкам библиотеки
     * @param options
     */
    connect(options: IConnectOptions): Promise<void>;

    /**
     * Авторизуемся в провайдере
     */
    login(): Promise<IUserData>;

    /**
     * Разрываем сессию
     */
    logout(): Promise<void>;

    /**
     * Подписываем текстовое сообщение
     * @param data
     */
    signMessage(
        data: string | number
    ): Promise<IOffchainSignResult<string | number>>;

    /**
     * Подписываем типизированные данные
     * @param data
     */
    signTypedData(
        data: Array<ITypedData>
    ): Promise<IOffchainSignResult<Array<ITypedData>>>;

    /**
     *
     * @param data
     */
    signBytes(
        data: Uint8Array | Array<number>
    ): Promise<IOffchainSignResult<Uint8Array | Array<number>>>;

    /**
     * Подписываем ордер
     * @param data
     */
    order(data: IOrder): Promise<IExchangeTransactionOrderWithProofs<TLong>>;

    /**
     *
     */
    encryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string>;

    /**
     *
     */
    decryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string>;

    /**
     * Подписываем массив транзакций
     * @param list
     */
    sign(
        list: Array<TTransactionParamWithType>
    ): Promise<Array<TTransactionWithProofs<TLong> & IWithId>>;
}

export interface IConnectOptions {
    /**
     * Урл ноды
     */
    NODE_URL: string;
    /**
     * Байт сети
     */
    NETWORK_BYTE: number;
}

export type TActionsApi<T> = {
    sign(): Promise<TParamsToSign<T>>;
    broadcast(options?: IBroadcastOptions): Promise<TParamsToApi<T>>;
};

export type TParamToSign<T> = T extends TTransactionParamWithType
    ? TTransactionWithProofsMap<TLong>[T['type']] & IWithId
    : never;

export type TParamsToSign<T> = T extends Array<TTransactionParamWithType>
    ? { [P in keyof T]: TParamToSign<T[P]> }
    : [TParamToSign<T>];

export type TParamToApi<T> = T extends TTransactionParamWithType
    ? TTransactionFromAPIMap<TLong>[T['type']]
    : never;

export type TParamsToApi<T> = T extends Array<TTransactionParamWithType>
    ? { [P in keyof T]: TParamToApi<T[P]> }
    : [TParamToApi<T>];
