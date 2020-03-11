/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
    AuthEvents,
    Handler,
    Order,
    OrderApi,
    OffchainSignResult,
} from './types';
import {
    IConsole,
    makeConsole,
    makeOptions,
    IGetMessageOptions,
    IMessage,
} from '@waves/client-logs';
import { fetchBalanceDetails } from '@waves/node-api-js/cjs/api-node/addresses';
import { fetchAssetsBalance } from '@waves/node-api-js/cjs/api-node/assets';
import wait from '@waves/node-api-js/cjs/tools/transactions/wait';
import broadcast from '@waves/node-api-js/cjs/tools/transactions/broadcast';
import getNetworkByte from '@waves/node-api-js/cjs/tools/blocks/getNetworkByte';
import { ChainApi1stCall } from './types/api-generated';
import {
    TRANSACTION_TYPE,
    TTransaction,
    TExchangeTransaction,
    TSignedTransaction,
} from '@waves/ts-types';
import {
    validateSignerOptions,
    validateProviderInterface,
    validateTxs,
} from './validation';
import { ERRORS, SignerError } from './SignerError';
import {
    errorHandlerFactory,
    normalizeBalanceDetails,
    normalizeAssetsBalance,
    orderRequestFactory,
} from './helpers';
import {
    ensureProvider,
    ensureAuth,
    handleProviderInternalErrors,
} from './decorators';

export * from './types';

export class Signer {
    public provider: Provider | undefined;
    public _handleError: (errorCode: number, errorArgs?: any) => SignerError; // private causes ts errors in decorators
    private _user: UserData | undefined;
    private readonly _options: SignerOptions;
    private readonly _networkBytePromise: Promise<number>;
    private readonly _logger: IConsole;

    constructor(options: Partial<SignerOptions>) {
        this._logger = makeConsole(
            makeOptions(options.LOG_LEVEL ?? 'production', 'Signer')
        );

        this._handleError = errorHandlerFactory(this._logger);

        const { isValid, invalidProperties } = validateSignerOptions(options);

        if (!isValid) {
            const error = this._handleError(
                ERRORS.SIGNER_OPTIONS,
                invalidProperties
            );

            throw error;
        }

        this._options = { ...DEFAULT_OPTIONS, ...(options || {}) };

        this._networkBytePromise = getNetworkByte(this._options.NODE_URL);

        this._logger.info(
            `Signer instance has been successfully created using options: ${JSON.stringify(
                options
            )}`
        );
    }

    @ensureProvider
    public on<EVENT extends keyof AuthEvents>(
        event: EVENT,
        hander: Handler<AuthEvents[EVENT]>
    ): Signer {
        this.provider!.on(event, hander);

        this._logger.info(`Handler for "${event}" event has been added.`);

        return this;
    }

    @ensureProvider
    public once<EVENT extends keyof AuthEvents>(
        event: EVENT,
        hander: Handler<AuthEvents[EVENT]>
    ): Signer {
        this.provider!.once(event, hander);

        this._logger.info(
            `One-Time handler for "${event}" event has been added.`
        );

        return this;
    }

    @ensureProvider
    public off<EVENT extends keyof AuthEvents>(
        event: EVENT,
        hander: Handler<AuthEvents[EVENT]>
    ): Signer {
        this.provider!.off(event, hander);

        this._logger.info(`Handler for "${event}" event has been removed.`);

        return this;
    }

    public getMessages(options?: IGetMessageOptions): Array<IMessage> {
        return this._logger.getMessages(options);
    }

    public async broadcast<T extends SignerTx>(
        toBroadcast: SignedTx<T>,
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<T>>>;
    public async broadcast<T extends SignerTx>(
        toBroadcast: SignedTx<T> | [SignedTx<T>],
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<T>> | BroadcastedTx<[SignedTx<T>]>> {
        try {
            const txs = (await broadcast(
                this._options.NODE_URL,
                toBroadcast as any, // TODO поправить тип в broadcast
                options
            )) as Promise<
                BroadcastedTx<SignedTx<T>> | BroadcastedTx<[SignedTx<T>]>
            >;

            this._logger.info('Transactions have been broadcasted.');

            return txs;
        } catch ({ message }) {
            const error = this._handleError(ERRORS.BROADCAST, message);

            throw error;
        }
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
            const error = this._handleError(
                ERRORS.PROVIDER_INTERFACE,
                providerValidation.invalidProperties
            );

            throw error;
        }

        this.provider = provider;

        this._logger.info('Provider has been set.');

        let networkByte;

        try {
            networkByte = await this._networkBytePromise;

            this._logger.info('Network byte has been fetched.');
        } catch ({ message }) {
            const error = this._handleError(ERRORS.NETWORK_BYTE, {
                error: message,
                node: this._options.NODE_URL,
            });

            throw error;
        }

        if (networkByte) {
            try {
                await provider.connect({
                    NODE_URL: this._options.NODE_URL,
                    NETWORK_BYTE: networkByte,
                });

                this._logger.info('Provider has conneced to node.');
            } catch ({ message }) {
                const error = this._handleError(ERRORS.PROVIDER_CONNECT, {
                    error: message,
                    node: this._options.NODE_URL,
                });

                throw error;
            }
        }
    }

    @ensureProvider
    @handleProviderInternalErrors
    public auth(
        expirationDate: Date | number
    ): Promise<OffchainSignResult<string>> {
        const expiration =
            expirationDate instanceof Date
                ? expirationDate.getTime()
                : expirationDate;

        return this.provider!.auth(expiration, location.hostname);
    }

    /**
     * Получаем список балансов пользователя (необходимо выполнить login перед использованием)
     * Basic usage example:
     *
     * ```ts
     * await waves.getBalance(); // Возвращает балансы пользователя
     * ```
     */
    @ensureAuth
    public getBalances(): Promise<Balance[]> {
        const userAddress = this._user!.address;

        return Promise.all([
            fetchBalanceDetails(this._options.NODE_URL, userAddress).then(
                normalizeBalanceDetails
            ),
            fetchAssetsBalance(this._options.NODE_URL, userAddress).then(
                normalizeAssetsBalance(userAddress)
            ),
        ])
            .then(([wavesBalance, assetsBalance]) => {
                this._logger.info('User balances have been fetched.');

                return [wavesBalance, ...assetsBalance];
            })
            .catch(({ message }) => {
                const error = this._handleError(ERRORS.BALANCE, message);

                throw error;
            });
    }

    /**
     * Получаем информацию о пользователе
     *
     * ```ts
     * await waves.login(); // Авторизуемся. Возвращает адрес и публичный ключ
     * ```
     */
    @ensureProvider
    @handleProviderInternalErrors
    public async login(): Promise<UserData> {
        this._user = await this.provider!.login();

        this._logger.info('Logged in.');

        return this._user;
    }

    /**
     * Вылогиниваемся из юзера
     */
    @ensureProvider
    @handleProviderInternalErrors
    public async logout(): Promise<void> {
        await this.provider!.logout();

        this._user = undefined;

        this._logger.info('Logged out.');
    }

    /**
     * Подписываем сообщение пользователя (провайдер может устанавливать префикс)
     * @param message
     */
    @ensureProvider
    @handleProviderInternalErrors
    public async signMessage(message: string | number): Promise<string> {
        const signedMessage = await this.provider!.signMessage(message);

        this._logger.info(`Message has been signed: ${message}`);

        return signedMessage;
    }

    /**
     * Подписываем типизированные данные
     * @param data
     */
    @ensureProvider
    @handleProviderInternalErrors
    public async signTypedData(data: Array<TypedData>): Promise<string> {
        const signedData = await this.provider!.signTypedData(data);

        this._logger.info(`Data has been signed: ${JSON.stringify(data)}`);

        return signedData;
    }

    /**
     * Получаем список балансов в кторых можно платить комиссию
     */
    public getSponsoredBalances(): Promise<Balance[]> {
        return this.getBalances().then((balance) =>
            balance.filter((item) => !!item.sponsorship)
        );
    }

    public order(data: Order): OrderApi {
        if (!this._options.MATCHER_URL) {
            const error = this._handleError(ERRORS.MATCHER_URL);

            throw error;
        }

        const { createLimitOrder, createMarketOrder } = orderRequestFactory(
            this._options.MATCHER_URL,
            this._handleError
        );

        const sign = () => this._signOrder(data);

        return {
            sign,
            limit: () => sign().then(createLimitOrder),
            market: () => sign().then(createMarketOrder),
        };
    }

    @ensureProvider
    @handleProviderInternalErrors
    private _signOrder(
        order: Order
    ): Promise<TSignedTransaction<TExchangeTransaction>> {
        return this.provider!.order(order);
    }

    @ensureProvider
    @handleProviderInternalErrors
    public encryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string> {
        return this.provider!.decryptMessage(sharedKey, message, prefix);
    }

    @ensureProvider
    @handleProviderInternalErrors
    public decryptMessage(
        sharedKey: string,
        message: string,
        prefix?: string
    ): Promise<string> {
        return this.provider!.decryptMessage(sharedKey, message, prefix);
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
    public async waitTxConfirm<T extends TTransaction>(
        tx: T,
        confirmations: number
    ): Promise<T>;
    public async waitTxConfirm<T extends TTransaction>(
        tx: T[],
        confirmations: number
    ): Promise<T[]>;
    public async waitTxConfirm<T extends TTransaction>(
        tx: T | T[],
        confirmations: number
    ): Promise<T | T[]> {
        try {
            return wait(this._options.NODE_URL, tx as any, { confirmations }); // TODO Fix types
        } catch ({ message }) {
            const error = this._handleError(ERRORS.WAIT_CONFIRMATION);

            throw error;
        }
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
            broadcast: async (options?: BroadcastOptions) => {
                const signedTxs = await this._sign<T>(txs as any);

                return this.broadcast<T>(signedTxs, options);
            },
        };
    }

    private async _sign<T extends SignerTx>(toSign: T): Promise<SignedTx<T>>;
    private async _sign<T extends SignerTx>(
        toSign: T[]
    ): Promise<[SignedTx<T>]>;
    @ensureProvider
    @handleProviderInternalErrors
    private async _sign<T extends SignerTx>(
        toSign: T | T[]
    ): Promise<SignedTx<T> | [SignedTx<T>]> {
        const validation = validateTxs(toSign);

        if (validation.isValid) {
            const signedTxs = await this.provider!.sign(toSign as any);

            this._logger.info('Transactions have been signed.');

            return signedTxs;
        } else {
            const error = this._handleError(
                ERRORS.API_ARGUMENTS,
                validation.errors
            );

            throw error;
        }
    }
}

// eslint-disable-next-line import/no-default-export
export default Signer;
