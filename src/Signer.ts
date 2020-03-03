import { DEFAULT_OPTIONS } from './constants';
import {
    TypedData,
    UserData,
    Provider,
    Balance,
    IssueArgs,
    TransferArgs,
    ReissueArgs,
    BurnArgs,
    LeaseArgs,
    CancelLeaseArgs,
    AliasArgs,
    MassTransferArgs,
    DataArgs,
    SetScriptArgs,
    SponsorshipArgs,
    ExchangeArgs,
    SetAssetScriptArgs,
    InvokeArgs,
    SignerTx,
    SignerIssueTx,
    SignerTransferTx,
    SignerReissueTx,
    SignerBurnTx,
    SignerLeaseTx,
    SignerExchangeTx,
    SignerCancelLeaseTx,
    SignerAliasTx,
    SignerMassTransferTx,
    SignerDataTx,
    SignerSponsorshipTx,
    SignerInvokeTx,
    SignerSetAssetScriptTx,
    SignerSetScriptTx,
    BroadcastOptions,
    SignerOptions,
    SignedTx,
    BroadcastedTx,
} from './types';
import { fetchBalanceDetails } from '@waves/node-api-js/cjs/api-node/addresses';
import { fetchAssetsBalance } from '@waves/node-api-js/cjs/api-node/assets';
import wait from '@waves/node-api-js/cjs/tools/transactions/wait';
import broadcast from '@waves/node-api-js/cjs/tools/transactions/broadcast';
import getNetworkByte from '@waves/node-api-js/cjs/tools/blocks/getNetworkByte';
import { ChainApi1stCall } from './types/api-generated';
import {
    TRANSACTION_TYPE,
    TTransaction,
    TTransactionType,
} from '@waves/ts-types';
import { validatorsMap } from './validation';
import { SignerError } from './SignerError';

export * from './types';

export class Signer {
    public currentProvider: Provider | undefined;
    private _userData: UserData | undefined;
    private __connectPromise: Promise<Provider> | undefined;
    private readonly _options: SignerOptions;
    private readonly _networkBytePromise: Promise<number>;

    private get _connectPromise(): Promise<Provider> {
        return this.__connectPromise || Promise.reject('Has no provider!');
    }

    private set _connectPromise(promise: Promise<Provider>) {
        this.__connectPromise = promise;
    }

    constructor(options?: Partial<SignerOptions>) {
        this._options = { ...DEFAULT_OPTIONS, ...(options || {}) };
        this._networkBytePromise = getNetworkByte(this._options.NODE_URL).then(
            (byte) => {
                return byte;
            }
        );
    }

    public broadcast<T extends SignerTx>(
        toBroadcast: Promise<SignedTx<T>>,
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<T>>>;
    public broadcast<T extends SignerTx>(
        toBroadcast: Promise<SignedTx<T> | [SignedTx<T>]>,
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<T>> | BroadcastedTx<[SignedTx<T>]>> {
        return toBroadcast.then((res: any) => {
            // any fixes "Expression produces a union type that is too complex to represent"
            return broadcast(this._options.NODE_URL, res as any, options); // TODO поправить тип в broadcast
        }) as Promise<
            BroadcastedTx<SignedTx<T>> | BroadcastedTx<[SignedTx<T>]>
        >;
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
    public setProvider(provider: Provider): Promise<void> {
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
    public getBalance(): Promise<Array<Balance>> {
        if (!this._userData) {
            return Promise.reject(new Error('Need login to get balances!'));
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
    public login(): Promise<UserData> {
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
    public signTypedData(data: Array<TypedData>): Promise<string> {
        return this._connectPromise.then((provider) =>
            provider.signTypedData(data)
        );
    }

    /**
     * Получаем список балансов в кторых можно платить комиссию
     */
    public getSponsoredBalances(): Promise<Balance[]> {
        return this.getBalance().then((balance) =>
            balance.filter((item) => !!item.sponsorship)
        );
    }

    public batch(tsx: SignerTx[]) {
        const sign = () => this._sign(tsx).then((result) => result);

        return {
            sign,
            broadcast: (opt?: BroadcastOptions) =>
                sign().then((transactions: any) =>
                    this.broadcast(transactions, opt)
                ),
        };
    }

    public issue(data: IssueArgs): ChainApi1stCall<SignerIssueTx> {
        return this._issue([])(data);
    }
    private readonly _issue = (txList: SignerTx[]) => (
        data: IssueArgs
    ): ChainApi1stCall<SignerIssueTx> => {
        return this._createPipelineAPI<SignerIssueTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.ISSUE,
        });
    };

    public transfer(data: TransferArgs): ChainApi1stCall<SignerTransferTx> {
        return this._transfer([])(data);
    }
    private readonly _transfer = (txList: SignerTx[]) => (
        data: TransferArgs
    ): ChainApi1stCall<SignerTransferTx> => {
        return this._createPipelineAPI<SignerTransferTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.TRANSFER,
        });
    };

    public reissue(data: ReissueArgs): ChainApi1stCall<SignerReissueTx> {
        return this._reissue([])(data);
    }
    private readonly _reissue = (txList: SignerTx[]) => (
        data: ReissueArgs
    ): ChainApi1stCall<SignerReissueTx> => {
        return this._createPipelineAPI<SignerReissueTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.REISSUE,
        });
    };

    public burn(data: BurnArgs): ChainApi1stCall<SignerBurnTx> {
        return this._burn([])(data);
    }
    private readonly _burn = (txList: SignerTx[]) => (
        data: BurnArgs
    ): ChainApi1stCall<SignerBurnTx> => {
        return this._createPipelineAPI<SignerBurnTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.BURN,
        });
    };

    public lease(data: LeaseArgs): ChainApi1stCall<SignerLeaseTx> {
        return this._lease([])(data);
    }
    private readonly _lease = (txList: SignerTx[]) => (
        data: LeaseArgs
    ): ChainApi1stCall<SignerLeaseTx> => {
        return this._createPipelineAPI<SignerLeaseTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.LEASE,
        });
    };

    public exchange(data: ExchangeArgs): ChainApi1stCall<SignerExchangeTx> {
        return this._exchange([])(data);
    }
    private readonly _exchange = (txList: SignerTx[]) => (
        data: ExchangeArgs
    ): ChainApi1stCall<SignerExchangeTx> => {
        return this._createPipelineAPI<SignerExchangeTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.EXCHANGE,
        });
    };

    public cancelLease(
        data: CancelLeaseArgs
    ): ChainApi1stCall<SignerCancelLeaseTx> {
        return this._cancelLease([])(data);
    }
    private readonly _cancelLease = (txList: SignerTx[]) => (
        data: CancelLeaseArgs
    ): ChainApi1stCall<SignerCancelLeaseTx> => {
        return this._createPipelineAPI<SignerCancelLeaseTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.CANCEL_LEASE,
        });
    };

    public alias(data: AliasArgs): ChainApi1stCall<SignerAliasTx> {
        return this._alias([])(data);
    }
    private readonly _alias = (txList: SignerTx[]) => (
        data: AliasArgs
    ): ChainApi1stCall<SignerAliasTx> => {
        return this._createPipelineAPI<SignerAliasTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.ALIAS,
        });
    };

    public massTransfer(
        data: MassTransferArgs
    ): ChainApi1stCall<SignerMassTransferTx> {
        return this._massTransfer([])(data);
    }
    private readonly _massTransfer = (txList: SignerTx[]) => (
        data: MassTransferArgs
    ): ChainApi1stCall<SignerMassTransferTx> => {
        return this._createPipelineAPI<SignerMassTransferTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.MASS_TRANSFER,
        });
    };

    public data(data: DataArgs): ChainApi1stCall<SignerDataTx> {
        return this._data([])(data);
    }
    private readonly _data = (txList: SignerTx[]) => (
        data: DataArgs
    ): ChainApi1stCall<SignerDataTx> => {
        return this._createPipelineAPI<SignerDataTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.DATA,
        });
    };

    public sponsorship(
        data: SponsorshipArgs
    ): ChainApi1stCall<SignerSponsorshipTx> {
        return this._sponsorship([])(data);
    }
    private readonly _sponsorship = (txList: SignerTx[]) => (
        sponsorship: SponsorshipArgs
    ): ChainApi1stCall<SignerSponsorshipTx> => {
        return this._createPipelineAPI<SignerSponsorshipTx>(txList, {
            ...sponsorship,
            type: TRANSACTION_TYPE.SPONSORSHIP,
        });
    };
    public setScript(data: SetScriptArgs): ChainApi1stCall<SignerSetScriptTx> {
        return this._setScript([])(data);
    }
    private readonly _setScript = (txList: SignerTx[]) => (
        setScript: SetScriptArgs
    ): ChainApi1stCall<SignerSetScriptTx> => {
        return this._createPipelineAPI<SignerSetScriptTx>(txList, {
            ...setScript,
            type: TRANSACTION_TYPE.SET_SCRIPT,
        });
    };

    public setAssetScript(
        data: SetAssetScriptArgs
    ): ChainApi1stCall<SignerSetAssetScriptTx> {
        return this._setAssetScript([])(data);
    }
    private readonly _setAssetScript = (txList: SignerTx[]) => (
        data: SetAssetScriptArgs
    ): ChainApi1stCall<SignerSetAssetScriptTx> => {
        return this._createPipelineAPI<SignerSetAssetScriptTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.SET_ASSET_SCRIPT,
        });
    };

    public invoke(data: InvokeArgs): ChainApi1stCall<SignerInvokeTx> {
        return this._invoke([])(data);
    }
    private readonly _invoke = (txList: SignerTx[]) => (
        data: InvokeArgs
    ): ChainApi1stCall<SignerInvokeTx> => {
        return this._createPipelineAPI<SignerInvokeTx>(txList, {
            ...data,
            type: TRANSACTION_TYPE.INVOKE_SCRIPT,
        });
    };

    /**
     * Ожидаем подтверждения транзакции
     * @param tx             транзакция
     * @param confirmations  количество подтверждений которое ожидаем
     */
    public waitTxConfirm<T extends TTransaction>(
        tx: T,
        confirmations: number
    ): Promise<T>;
    public waitTxConfirm<T extends TTransaction>(
        tx: T[],
        confirmations: number
    ): Promise<T[]>;
    public waitTxConfirm<T extends TTransaction>(
        tx: T | T[],
        confirmations: number
    ): Promise<T | T[]> {
        return wait(this._options.NODE_URL, tx as any, { confirmations }); // TODO Fix types
    }

    private _createPipelineAPI<T extends SignerTx>(
        prevCallTxList: SignerTx[],
        signerTx: T
    ): ChainApi1stCall<T> {
        const txs = prevCallTxList.length
            ? [...prevCallTxList, signerTx]
            : signerTx;

        const chainArgs = Array.isArray(txs) ? txs : [txs];

        return {
            ...({
                issue: this._issue(chainArgs),
                transfer: this._transfer(chainArgs),
                reissue: this._reissue(chainArgs),
                burn: this._burn(chainArgs),
                lease: this._lease(chainArgs),
                exchange: this._exchange(chainArgs),
                cancelLease: this._cancelLease(chainArgs),
                alias: this._alias(chainArgs),
                massTransfer: this._massTransfer(chainArgs),
                data: this._data(chainArgs),
                sponsorship: this._sponsorship(chainArgs),
                setScript: this._setScript(chainArgs),
                setAssetScript: this._setAssetScript(chainArgs),
                invoke: this._invoke(chainArgs),
            } as any),
            sign: () => this._sign<T>(txs as any),
            broadcast: (options?: BroadcastOptions) =>
                this.broadcast<T>(this._sign<T>(txs as any), options),
        };
    }

    private _validate<T>(toSign: T): { isValid: boolean; errors: string[] };
    private _validate<T>(toSign: T[]): { isValid: boolean; errors: string[] };
    private _validate<T extends SignerTx>(
        toSign: T | T[]
    ): { isValid: boolean; errors: string[] } {
        const signerTxs = Array.isArray(toSign) ? toSign : [toSign];

        const validateTx = (tx: SignerTx) => validatorsMap[tx.type](tx);
        const knownTxPredicate = (type: TTransactionType) =>
            Object.keys(validatorsMap).includes(String(type));

        const unknownTxs = signerTxs.filter(
            ({ type }) => !knownTxPredicate(type)
        );
        const knownTxs = signerTxs.filter(({ type }) => knownTxPredicate(type));

        const invalidTxs = knownTxs
            .map(validateTx)
            .filter(({ isValid }) => !isValid);

        if (invalidTxs.length === 0 && unknownTxs.length === 0) {
            return { isValid: true, errors: [] };
        } else {
            if (process.env.NODE_ENV === 'production' && !this._options.debug) {
                console.warn(
                    'Signer validation error. Invalid transaction(s) arguments'
                );
            } else {
                invalidTxs.forEach(
                    ({ transaction, method: scope, invalidFields }) => {
                        console.warn(
                            '%cValidation error for %c%s %ctransaction: %O. Ivalid arguments: %c%s',
                            'color: red',
                            'color: default',
                            scope,
                            'color:red',
                            transaction,
                            'color: default',
                            invalidFields?.join(', ')
                        );
                    }
                );

                unknownTxs.forEach((tx) => {
                    console.warn(
                        '%cValidation error for transaction: %O. Unknown transaction type: %c%s',
                        'color: red',
                        tx,
                        'color: default',
                        tx.type
                    );
                });
            }

            return {
                isValid: false,
                errors: [
                    ...invalidTxs.map(
                        ({ transaction, method: scope, invalidFields }) =>
                            `Validation error for ${scope} transaction: ${JSON.stringify(
                                transaction
                            )}. Invalid arguments: ${invalidFields?.join(', ')}`
                    ),
                    ...unknownTxs.map(
                        (tx) =>
                            `Validation error for transaction ${JSON.stringify(
                                tx
                            )}. Unknown transaction type: ${tx.type}`
                    ),
                ],
            };
        }
    }

    private _sign<T extends SignerTx>(toSign: T): Promise<SignedTx<T>>;
    private _sign<T extends SignerTx>(toSign: T[]): Promise<[SignedTx<T>]>;
    private _sign<T extends SignerTx>(
        toSign: T | T[]
    ): Promise<SignedTx<T> | [SignedTx<T>]> {
        const validation = this._validate(toSign);

        if (validation.isValid) {
            return this._connectPromise.then(
                (provider) => provider.sign(toSign as any) // any fixes "Expression produces a union type that is too complex to
            );
        } else {
            throw new SignerError(1010, validation.errors);
        }
    }
}

// eslint-disable-next-line import/no-default-export
export default Signer;
