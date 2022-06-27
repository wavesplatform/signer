import {
    Proofs,
    IssueTransactionFields,
    TransferTransactionFields,
    Long,
    ReissueTransactionFields,
    BurnTransactionFields,
    LeaseTransactionFields,
    CancelLeaseTransactionFields,
    MassTransferTransactionFields,
    AliasTransactionFields,
    DataTransactionFields,
    SetScriptTransactionFields,
    SponsorshipTransactionFields,
    ExchangeTransactionFields,
    SetAssetScriptTransactionFields,
    InvokeScriptTransactionFields,
    UpdateAssetInfoTransactionFields,
    TransactionType,
    TRANSACTION_TYPE,
    SignedTransaction,
    WithApiMixin,
    TransactionMap,
    WithId,
    BaseTransaction,
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

export interface Provider {
    user: UserData | null;

    isSignAndBroadcastByProvider?: boolean;

    on<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>,
    ): Provider;

    once<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>,
    ): Provider;

    off<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>,
    ): Provider;

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
    sign<T extends SignerTx>(toSign: T[]): Promise<SignedTx<T>>;
    sign<T extends Array<SignerTx>>(toSign: T): Promise<SignedTx<T>>;
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
}

type CommonArgs = Partial<
    Pick<BaseTransaction, 'fee' | 'senderPublicKey' | 'timestamp'>
> & {
    proofs?: Proofs;
} & { version?: number };

export type IssueArgs = CommonArgs &
    MakeOptional<IssueTransactionFields, 'script' | 'description' | 'reissuable'>;

export type TransferArgs = CommonArgs &
    MakeOptional<TransferTransactionFields, 'assetId' | 'feeAssetId' | 'attachment'>;

export type ReissueArgs = CommonArgs & ReissueTransactionFields;

export type BurnArgs = CommonArgs & BurnTransactionFields;

export type LeaseArgs = CommonArgs & LeaseTransactionFields;

export type CancelLeaseArgs = CommonArgs & CancelLeaseTransactionFields;

export type AliasArgs = CommonArgs & AliasTransactionFields;

export type MassTransferArgs = CommonArgs &
    MakeOptional<MassTransferTransactionFields, 'assetId'>;

export type DataArgs = CommonArgs & DataTransactionFields;

export type SetScriptArgs = CommonArgs & SetScriptTransactionFields;

export type SponsorshipArgs = CommonArgs & SponsorshipTransactionFields;

export type ExchangeArgs = CommonArgs & ExchangeTransactionFields;

export type SetAssetScriptArgs = CommonArgs & SetAssetScriptTransactionFields;

export type InvokeArgs = CommonArgs &
    MakeOptional<InvokeScriptTransactionFields, 'payment' | 'call' | 'feeAssetId'>;

export type UpdateAssetIngoArgs = CommonArgs &
    MakeOptional<UpdateAssetInfoTransactionFields, 'description' | 'name'>;

type SignerTxFactory<TxArgs, TxType extends TransactionType> = TxArgs & {
    type: TxType;
};

export type SignerIssueTx = SignerTxFactory<IssueArgs,
    typeof TRANSACTION_TYPE.ISSUE>;
export type SignerTransferTx = SignerTxFactory<TransferArgs,
    typeof TRANSACTION_TYPE.TRANSFER>;
export type SignerReissueTx = SignerTxFactory<ReissueArgs,
    typeof TRANSACTION_TYPE.REISSUE>;
export type SignerBurnTx = SignerTxFactory<BurnArgs,
    typeof TRANSACTION_TYPE.BURN>;
export type SignerLeaseTx = SignerTxFactory<LeaseArgs,
    typeof TRANSACTION_TYPE.LEASE>;
export type SignerCancelLeaseTx = SignerTxFactory<CancelLeaseArgs,
    typeof TRANSACTION_TYPE.CANCEL_LEASE>;
export type SignerAliasTx = SignerTxFactory<AliasArgs,
    typeof TRANSACTION_TYPE.ALIAS>;
export type SignerMassTransferTx = SignerTxFactory<MassTransferArgs,
    typeof TRANSACTION_TYPE.MASS_TRANSFER>;
export type SignerDataTx = SignerTxFactory<DataArgs,
    typeof TRANSACTION_TYPE.DATA>;
export type SignerSetScriptTx = SignerTxFactory<SetScriptArgs,
    typeof TRANSACTION_TYPE.SET_SCRIPT>;
export type SignerSponsorshipTx = SignerTxFactory<SponsorshipArgs,
    typeof TRANSACTION_TYPE.SPONSORSHIP>;
export type SignerExchangeTx = SignerTxFactory<ExchangeArgs,
    typeof TRANSACTION_TYPE.EXCHANGE>;
export type SignerSetAssetScriptTx = SignerTxFactory<SetAssetScriptArgs,
    typeof TRANSACTION_TYPE.SET_ASSET_SCRIPT>;
export type SignerInvokeTx = SignerTxFactory<InvokeArgs,
    typeof TRANSACTION_TYPE.INVOKE_SCRIPT>;
export type SignerUpdateAssetInfoTx = SignerTxFactory<UpdateAssetIngoArgs,
    typeof TRANSACTION_TYPE.UPDATE_ASSET_INFO>

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
    | SignerInvokeTx
    | SignerUpdateAssetInfoTx;

export type Balance = {
    /**
     * Amount of money on balance
     * returned in minimum indivisible parts
     * for example 1 WAVES = 100000000 in this API
     */
    amount: Long;
    /**
     * Amount of money on balance
     * returned in minimum indivisible parts
     * (API data multiplied by 10 to the power of decimals)
     */
    tokens: Long;
    /**
     * If there is a field, then it contains a rate for paying a commission
     * (to 0.001 WAVES)
     */
    sponsorship?: Long | null;
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
     * @default https://nodes.wavesnodes.com
     */
    NODE_URL: string;
    /**
     * Урл матчера (временно не поддерживается)
     */
    // MATCHER_URL: string;
    LOG_LEVEL?: 'verbose' | 'production' | 'error';
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
export type SignerTxToSignedTx<T> =
    T extends SignerTx
        ? T['type'] extends keyof TransactionMap
        ? SignedTransaction<TransactionMap[T['type']]> & WithId
        : never
        : never;

export type SignedTx<T> = T extends SignerTx[]
    ? { [P in keyof T]: SignerTxToSignedTx<T[P]> }
    : SignerTxToSignedTx<T>;

export type BroadcastedTx<T> = T extends SignedTx<SignerTx>[]
    ? { [P in keyof T]: T[P] & WithApiMixin }
    : T extends SignedTx<SignerTx>
        ? T & WithApiMixin
        : never;

export type Handler<T> = (data: T) => any;

export type AuthEvents = {
    login: Readonly<UserData>;
    logout: void;
};
