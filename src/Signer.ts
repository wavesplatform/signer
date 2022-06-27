import { DEFAULT_OPTIONS } from './constants';
import {
    AliasArgs,
    AuthEvents,
    Balance,
    BroadcastedTx,
    BroadcastOptions,
    BurnArgs,
    CancelLeaseArgs,
    DataArgs,
    ExchangeArgs,
    Handler,
    InvokeArgs,
    IssueArgs,
    LeaseArgs,
    MassTransferArgs,
    Provider,
    ReissueArgs,
    SetAssetScriptArgs,
    SetScriptArgs,
    SignedTx,
    SignerAliasTx,
    SignerBurnTx,
    SignerCancelLeaseTx,
    SignerDataTx,
    SignerExchangeTx,
    SignerInvokeTx,
    SignerIssueTx,
    SignerLeaseTx,
    SignerMassTransferTx,
    SignerOptions,
    SignerReissueTx,
    SignerSetAssetScriptTx,
    SignerSetScriptTx,
    SignerSponsorshipTx,
    SignerTransferTx,
    SignerTx,
    SponsorshipArgs,
    TransferArgs,
    TypedData,
    UserData,
} from './types';
import { IConsole, makeConsole, makeOptions } from '@waves/client-logs';
import { fetchBalanceDetails } from '@waves/node-api-js/cjs/api-node/addresses';
import { fetchAssetsBalance } from '@waves/node-api-js/cjs/api-node/assets';
import wait from '@waves/node-api-js/cjs/tools/transactions/wait';
import broadcast from '@waves/node-api-js/cjs/tools/transactions/broadcast';
import getNetworkByte from '@waves/node-api-js/cjs/tools/blocks/getNetworkByte';
import { ChainApi1stCall } from './types/api';
import {
    Transaction,
    TRANSACTION_TYPE,
    TransactionType,
} from '@waves/ts-types';
import {
    argsValidators,
    validateProviderInterface,
    validateSignerOptions,
} from './validation';
import { ERRORS } from './SignerError';
import { ErrorHandler, errorHandlerFactory } from './helpers';
import { catchProviderError, checkAuth, ensureProvider } from './decorators';

export * from './types';

export class Signer {
    public currentProvider: Provider | undefined;
    private _userData: UserData | undefined;
    private __connectPromise: Promise<Provider> | undefined;
    private readonly _options: SignerOptions;
    private readonly _networkBytePromise: Promise<number>;
    private readonly _logger: IConsole;
    private readonly _handleError: ErrorHandler;

    private get _connectPromise(): Promise<Provider> {
        return this.__connectPromise || Promise.reject('Has no provider!');
    }

    private set _connectPromise(promise: Promise<Provider>) {
        this.__connectPromise = promise;
    }

    constructor(options?: Partial<SignerOptions>) {
        this._logger = makeConsole(
            makeOptions(options?.LOG_LEVEL ?? 'production', 'Signer')
        );

        this._handleError = errorHandlerFactory(this._logger);

        this._options = { ...DEFAULT_OPTIONS, ...(options || {}) };

        const { isValid, invalidOptions } = validateSignerOptions(
            this._options
        );

        if (!isValid) {
            const error = this._handleError(ERRORS.SIGNER_OPTIONS, [
                invalidOptions,
            ]);

            throw error;
        }

        const makeNetworkByteError = (e: Error) => {
            const error = this._handleError(ERRORS.NETWORK_BYTE, [
                {
                    error: e.message,
                    node: this._options.NODE_URL,
                },
            ]);

            this._logger.error(error);

            return error;
        };

        try {
            this._networkBytePromise = getNetworkByte(
                this._options.NODE_URL
            ).catch((e) => Promise.reject(makeNetworkByteError(e)));
        } catch (e) {
            throw makeNetworkByteError(e);
        }

        this._logger.info(
            'Signer instance has been successfully created. Options: ',
            options
        );
    }

    @ensureProvider
    public on<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Signer {
        this.currentProvider!.on(event, handler);
        this._logger.info(`Handler for "${event}" has been added.`);

        return this;
    }

    @ensureProvider
    public once<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Signer {
        this.currentProvider!.once(event, handler);

        this._logger.info(`One-Time handler for "${event}" has been added.`);

        return this;
    }

    @ensureProvider
    public off<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Signer {
        this.currentProvider!.off(event, handler);

        this._logger.info(`Handler for "${event}" has been removed.`);

        return this;
    }

    public broadcast<T extends SignerTx>(
        toBroadcast: SignedTx<T>,
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<T>>>;
    public broadcast<T extends SignerTx>(
        toBroadcast: Array<SignedTx<T>>,
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<T>[]>>;
    public broadcast<T extends SignerTx>(
        toBroadcast: SignedTx<T> | Array<SignedTx<T>>,
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<T>> | BroadcastedTx<Array<SignedTx<T>>>> {
        // @ts-ignore
        return broadcast(this._options.NODE_URL, toBroadcast, options); // TODO поправить тип в broadcast
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
    public async setProvider(provider: Provider): Promise<void> {
        const providerValidation = validateProviderInterface(provider);

        if (!providerValidation.isValid) {
            const error = this._handleError(ERRORS.PROVIDER_INTERFACE, [
                providerValidation.invalidProperties,
            ]);

            throw error;
        }

        this.currentProvider = provider;
        this._logger.info('Provider has been set.');

        this._connectPromise = this._networkBytePromise.then((byte) => {
            return provider
                .connect({
                    NETWORK_BYTE: byte,
                    NODE_URL: this._options.NODE_URL,
                })
                .then(() => {
                    this._logger.info('Provider has connected to node.');

                    return provider;
                })
                .catch((e) => {
                    const error = this._handleError(ERRORS.PROVIDER_CONNECT, [
                        {
                            error: e.message,
                            node: this._options.NODE_URL,
                        },
                    ]);

                    this._logger.error(error);

                    return Promise.reject(error);
                });
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
    @ensureProvider
    @checkAuth
    public getBalance(): Promise<Array<Balance>> {
        return Promise.all([
            fetchBalanceDetails(
                this._options.NODE_URL,
                this._userData!.address
            ).then((data) => ({
                assetId: 'WAVES',
                assetName: 'Waves',
                decimals: 8,
                amount: String(data.available),
                isMyAsset: false,
                tokens: Number(data.available) * Math.pow(10, 8),
                sponsorship: null,
                isSmart: false,
            })),
            fetchAssetsBalance(
                this._options.NODE_URL,
                this._userData!.address
            ).then((data) =>
                data.balances.map((item) => ({
                    assetId: item.assetId,
                    assetName: item.issueTransaction.name,
                    decimals: item.issueTransaction.decimals,
                    amount: String(item.balance),
                    isMyAsset:
                        item.issueTransaction.sender ===
                        this._userData!.address,
                    tokens:
                        Number(item.balance) *
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
     * В данном методе НЕЛЬЗЯ использовать асинхронность.
     * Метод login провайдера должен вызываться синхронно в контексте вызова метода!
     * ```ts
     * await waves.login(); // Авторизуемся. Возвращает адрес и публичный ключ
     * ```
     */
    @ensureProvider
    public login(): Promise<UserData> {
        return this.currentProvider!.login()
            .then((data) => {
                this._logger.info('Logged in.');
                this._userData = data;

                return data;
            })
            .catch((err) => {
                if (err === 'Error: User rejection!') {
                    throw err;
                }

                const error = this._handleError(ERRORS.PROVIDER_INTERNAL, [
                    err.message,
                ]);

                throw error;
            });
    }

    /**
     * Вылогиниваемся из юзера
     */
    @ensureProvider
    public async logout(): Promise<void> {
        await this._connectPromise;

        try {
            await this.currentProvider!.logout();

            this._userData = undefined;

            this._logger.info('Logged out.');
        } catch ({ message }) {
            const error = this._handleError(ERRORS.PROVIDER_INTERNAL, message);

            throw error;
        }
    }

    /**
     * Подписываем сообщение пользователя (провайдер может устанавливать префикс)
     * @param message
     */
    @ensureProvider
    public signMessage(message: string | number): Promise<string> {
        return this._connectPromise.then((provider) =>
            provider.signMessage(message)
        );
    }

    /**
     * Подписываем типизированные данные
     * @param data
     */
    @ensureProvider
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
        const sign = (): Promise<SignedTx<SignerTx>[]> =>
            this._sign(tsx).then((result) => result);

        return {
            sign,
            broadcast: (
                opt?: BroadcastOptions
            ): Promise<BroadcastedTx<SignedTx<SignerTx>>[]> =>
                sign().then((transactions) =>
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
    public waitTxConfirm<T extends Transaction>(
        tx: T,
        confirmations: number
    ): Promise<T>;
    public waitTxConfirm<T extends Transaction>(
        tx: T[],
        confirmations: number
    ): Promise<T[]>;
    public waitTxConfirm<T extends Transaction>(
        tx: T | T[],
        confirmations: number
    ): Promise<T | T[]> {
        return wait(this._options.NODE_URL, tx as any, { confirmations }); // TODO Fix types
    }

    private _createPipelineAPI<T extends SignerTx>(
        prevCallTxList: SignerTx[],
        signerTx: T
    ): ChainApi1stCall<T> {
        const _this = this;
        const txs = prevCallTxList.length
            ? [...prevCallTxList, signerTx]
            : [signerTx];

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
            broadcast: function(options?: BroadcastOptions) {
                if (
                    _this.currentProvider?.isSignAndBroadcastByProvider === true
                ) {
                    return _this.currentProvider.sign(txs);
                } else {
                    return (
                        this.sign()
                            // @ts-ignore
                            .then((txs) => _this.broadcast(txs, options)) as any
                    );
                }
            },
        };
    }

    private _validate<T>(toSign: T): { isValid: boolean; errors: string[] };
    private _validate<T>(toSign: T[]): { isValid: boolean; errors: string[] };
    private _validate<T extends SignerTx>(
        toSign: T | T[]
    ): { isValid: boolean; errors: string[] } {
        const signerTxs = Array.isArray(toSign) ? toSign : [toSign];

        const validateTx = (tx: SignerTx) => argsValidators[tx.type](tx);
        const knownTxPredicate = (type: TransactionType) =>
            Object.keys(argsValidators).includes(String(type));

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
    @catchProviderError
    private _sign<T extends SignerTx>(toSign: T[]): Promise<SignedTx<T>[]> {
        const validation = this._validate(toSign);

        if (this.currentProvider?.isSignAndBroadcastByProvider === true) {
            const error = this._handleError(
                ERRORS.PROVIDER_SIGN_NOT_SUPPORTED,
                [
                    {
                        error: 'PROVIDER_SIGN_NOT_SUPPORTED',
                        node: this._options.NODE_URL,
                    },
                ]
            );

            throw error;
        }

        if (validation.isValid) {
            return this._connectPromise.then(
                (provider) => provider.sign(toSign as any)
                // any fixes "Expression produces a union type that is too complex to
            );
        } else {
            const error = this._handleError(ERRORS.API_ARGUMENTS, [
                validation.errors,
            ]);

            throw error;
        }
    }
}

// eslint-disable-next-line import/no-default-export
export default Signer;
