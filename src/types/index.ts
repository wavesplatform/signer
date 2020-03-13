import {
    ITransaction,
    TProofs,
    IIssueTransactionFields,
    ITransferTransactionFields,
    ITransferTransactionV3,
    TLong,
    IReissueTransactionFields,
    IBurnTransactionFields,
    ILeaseTransactionFields,
    ICancelLeaseTransactionFields,
    IMassTransferTransactionFields,
    IMassTransferTransactionV2,
    IAliasTransactionFields,
    IDataTransactionFields,
    ISetScriptTransactionFields,
    ISponsorshipTransactionFields,
    IExchangeTransactionFields,
    ISetAssetScriptTransactionFields,
    IInvokeScriptTransactionFields,
    TTransactionType,
    TRANSACTION_TYPE,
    TSignedTransaction,
    IWithApiMixin,
    TTransactionMap,
    TExchangeTransaction,
} from '@waves/ts-types';

export interface TypedData {
    /**
     * Field type
     */
    type: 'string' | 'integer' | 'boolean' | 'binary';
    /**
     * Field name
     */
    key: string;
    /**
     * Value
     */
    value: string | number | boolean;
}

export interface Order<LONG = TLong> {
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

export interface Provider {
    user: UserData | null;
    repositoryUrl: string;

    on<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Provider;

    once<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Provider;

    off<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Provider;

    order(data: Order): Promise<TSignedTransaction<TExchangeTransaction>>;

    encryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string>;

    decryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string>;

    /**
     * Connect the provider to the library settings
     * @param options
     */
    connect(options: ConnectOptions): Promise<void>;

    /**
     * Logs in user using provider
     */
    login(): Promise<UserData>;

    /**
     * logs out from provider
     */
    logout(): Promise<void>;

    /**
     * Sign message
     * @param data
     */
    signMessage(data: string | number): Promise<string>;

    /**
     * Sign typed data
     * @param data
     */
    signTypedData(data: Array<TypedData>): Promise<string>;

    /**
     * Sign an array of transactions
     * @param list
     */
    sign<T extends SignerTx>(toSign: T): Promise<SignedTx<T>>;
    sign<T extends SignerTx>(toSign: T[]): Promise<[SignedTx<T>]>;
    sign<T extends SignerTx>(
        toSign: T | T[]
    ): Promise<SignedTx<T> | [SignedTx<T>]>;

    auth(
        expirationDate: number,
        prefix?: string
    ): Promise<OffchainSignResult<string>>;
}

export interface UserData {
    /**
     * User address
     */
    address: string;
    /**
     * Public key
     */
    publicKey: string;
}

export interface ConnectOptions {
    /**
     * Node URL
     */
    NODE_URL: string;
    /**
     * Network byte
     */
    NETWORK_BYTE: number;
    MATHCER_URL?: string;
}

type CommonArgs = Partial<Pick<ITransaction, 'fee' | 'senderPublicKey'>> & {
    proofs?: TProofs;
} & { version?: 1 | 2 | 3 };

export type IssueArgs = CommonArgs &
    MakeOptional<IIssueTransactionFields, 'chainId' | 'script'>;

export type TransferArgs = CommonArgs &
    MakeOptional<ITransferTransactionFields, 'assetId' | 'feeAssetId'> &
    Partial<Pick<ITransferTransactionV3<TLong>, 'attachment'>>;

export type ReissueArgs = CommonArgs &
    MakeOptional<IReissueTransactionFields, 'chainId'>;

export type BurnArgs = CommonArgs &
    MakeOptional<IBurnTransactionFields, 'chainId'>;

export type LeaseArgs = CommonArgs & ILeaseTransactionFields;

export type CancelLeaseArgs = CommonArgs &
    MakeOptional<ICancelLeaseTransactionFields, 'chainId'>;

export type AliasArgs = CommonArgs & IAliasTransactionFields;

export type MassTransferArgs = CommonArgs &
    MakeOptional<IMassTransferTransactionFields, 'assetId'> &
    Partial<Pick<IMassTransferTransactionV2<TLong>, 'attachment'>>;

export type DataArgs = CommonArgs & IDataTransactionFields;

export type SetScriptArgs = CommonArgs &
    MakeOptional<ISetScriptTransactionFields, 'chainId'>;

export type SponsorshipArgs = CommonArgs & ISponsorshipTransactionFields;

export type ExchangeArgs = CommonArgs & IExchangeTransactionFields;

export type SetAssetScriptArgs = CommonArgs &
    MakeOptional<ISetAssetScriptTransactionFields, 'chainId'>;

export type InvokeArgs = CommonArgs &
    MakeOptional<
        IInvokeScriptTransactionFields,
        'chainId' | 'payment' | 'call' | 'feeAssetId'
    >;

type SignerTxFactory<TxArgs, TxType extends TTransactionType> = TxArgs & {
    type: TxType;
};

export type SignerIssueTx = SignerTxFactory<
    IssueArgs,
    typeof TRANSACTION_TYPE.ISSUE
>;
export type SignerTransferTx = SignerTxFactory<
    TransferArgs,
    typeof TRANSACTION_TYPE.TRANSFER
>;
export type SignerReissueTx = SignerTxFactory<
    ReissueArgs,
    typeof TRANSACTION_TYPE.REISSUE
>;
export type SignerBurnTx = SignerTxFactory<
    BurnArgs,
    typeof TRANSACTION_TYPE.BURN
>;
export type SignerLeaseTx = SignerTxFactory<
    LeaseArgs,
    typeof TRANSACTION_TYPE.LEASE
>;
export type SignerCancelLeaseTx = SignerTxFactory<
    CancelLeaseArgs,
    typeof TRANSACTION_TYPE.CANCEL_LEASE
>;
export type SignerAliasTx = SignerTxFactory<
    AliasArgs,
    typeof TRANSACTION_TYPE.ALIAS
>;
export type SignerMassTransferTx = SignerTxFactory<
    MassTransferArgs,
    typeof TRANSACTION_TYPE.MASS_TRANSFER
>;
export type SignerDataTx = SignerTxFactory<
    DataArgs,
    typeof TRANSACTION_TYPE.DATA
>;
export type SignerSetScriptTx = SignerTxFactory<
    SetScriptArgs,
    typeof TRANSACTION_TYPE.SET_SCRIPT
>;
export type SignerSponsorshipTx = SignerTxFactory<
    SponsorshipArgs,
    typeof TRANSACTION_TYPE.SPONSORSHIP
>;
export type SignerExchangeTx = SignerTxFactory<
    ExchangeArgs,
    typeof TRANSACTION_TYPE.EXCHANGE
>;
export type SignerSetAssetScriptTx = SignerTxFactory<
    SetAssetScriptArgs,
    typeof TRANSACTION_TYPE.SET_ASSET_SCRIPT
>;
export type SignerInvokeTx = SignerTxFactory<
    InvokeArgs,
    typeof TRANSACTION_TYPE.INVOKE_SCRIPT
>;

export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
    Partial<Pick<T, K>>;

export type SignerTx =
    | SignerIssueTx
    | SignerTransferTx
    | SignerReissueTx
    | SignerBurnTx
    | SignerLeaseTx
    | SignerCancelLeaseTx
    | SignerAliasTx
    | SignerMassTransferTx
    | SignerDataTx
    | SignerSetScriptTx
    | SignerSponsorshipTx
    | SignerExchangeTx
    | SignerSetAssetScriptTx
    | SignerInvokeTx;

export type Balance = {
    /**
     * Amount of money on balance
     * returned in minimum indivisible parts
     * for example 1 WAVES = 100000000 in this API
     */
    amount: TLong;
    /**
     * Amount of money on balance
     * returned in minimum indivisible parts
     * (API data multiplied by 10 to the power of decimals)
     */
    tokens: TLong;
    /**
     * If there is a field, then it contains a rate for paying a commission
     * (to 0.001 WAVES)
     */
    sponsorship?: TLong | null;
    assetId: string;
    assetName: string;
    decimals: number;
    isMyAsset: boolean;
    isSmart: boolean;
};

export interface SignerOptions {
    /**
     * Урл ноды  с которой будет работать библиотека
     * Байт сети получаем из урла ноды (из последнего блока)
     * @default https://nodes.wavesplatform.com
     */
    NODE_URL: string;
    /**
     * Урл матчера (временно не поддерживается)
     */
    LOG_LEVEL?: 'verbose' | 'production' | 'error';
    MATCHER_URL?: string;
}

export interface BroadcastOptions {
    /**
     * Оправлять транзакции после попадания предыдущей в блокчейн
     */
    chain?: boolean;
    /**
     * Количество подтверждений после которого будет резолвится промис (для всех транзакций)
     */
    confirmations?: number;
}

// Мапит транзакцию сайнера в транзакцию из @waves/ts-types
export type SignerTxToSignedTx<T> = T extends SignerTx
    ? T['type'] extends keyof TTransactionMap
        ? TSignedTransaction<TTransactionMap[T['type']]>
        : never
    : never;

export type SignedTx<T> = T extends SignerTx[]
    ? { [P in keyof T]: SignerTxToSignedTx<T[P]> }
    : SignerTxToSignedTx<T>;

export type BroadcastedTx<T> = T extends SignedTx<SignerTx>[]
    ? { [P in keyof T]: T[P] & IWithApiMixin }
    : T extends SignedTx<SignerTx>
    ? T & IWithApiMixin
    : never;

export type Handler<T> = (data: T) => any;

export type AuthEvents = {
    login: UserData;
    logout: void;
};

export type SignedOrder = TSignedTransaction<TExchangeTransaction>;

export type OrderApi = {
    sign(): Promise<SignedOrder>;
    limit(): Promise<any>;
    market(): Promise<any>;
};

export type OffchainSignResult<T> = {
    signedData: T;
    bytes: Array<number>;
    signature: string;
};
