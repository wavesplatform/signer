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
    SignerAssetScriptTx,
    SignerSetScriptTx,
    BroadcastOptions,
    SignerOptions,
} from './types';
import { fetchBalanceDetails } from '@waves/node-api-js/cjs/api-node/addresses';
import { fetchAssetsBalance } from '@waves/node-api-js/cjs/api-node/assets';
import wait from '@waves/node-api-js/cjs/tools/transactions/wait';
import broadcast from '@waves/node-api-js/cjs/tools/transactions/broadcast';
import getNetworkByte from '@waves/node-api-js/cjs/tools/blocks/getNetworkByte';
import { ChainApiFirstCall, SignedTx, BroadcastedTx } from './types/api';
import { TRANSACTION_TYPE, TTransaction } from '@waves/ts-types';

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
    public async broadcast<T extends SignerTx>(
        toBroadcast: Promise<SignedTx<T> | [SignedTx<T>]>,
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<T>> | BroadcastedTx<[SignedTx<T>]>> {
        return toBroadcast.then(async (res) => {
            return broadcast(this._options.NODE_URL, res as any, options); // TODO поправить тип в broadcast
        }) as Promise<
            BroadcastedTx<SignedTx<T>> | BroadcastedTx<[SignedTx<T>]>
        >;
    }

    /**
     * Запросить байт сети
     */
    public async getNetworkByte(): Promise<number> {
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
        this.currentProvider = provider;

        const result = this._networkBytePromise.then(async (networkByte) =>
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
    public async getBalance(): Promise<Array<Balance>> {
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
    public async login(): Promise<UserData> {
        return this._connectPromise
            .then(async (provider) => provider.login())
            .then((data) => {
                this._userData = data;

                return data;
            });
    }

    /**
     * Вылогиниваемся из юзера
     */
    public async logout(): Promise<void> {
        return this._connectPromise
            .then(async (provider) => provider.logout())
            .then(() => {
                this._userData = undefined;
            });
    }

    /**
     * Подписываем сообщение пользователя (провайдер может устанавливать префикс)
     * @param message
     */
    public async signMessage(message: string | number): Promise<string> {
        return this._connectPromise.then(async (provider) =>
            provider.signMessage(message)
        );
    }

    /**
     * Подписываем типизированные данные
     * @param data
     */
    public async signTypedData(data: Array<TypedData>): Promise<string> {
        return this._connectPromise.then(async (provider) =>
            provider.signTypedData(data)
        );
    }

    /**
     * Получаем список балансов в кторых можно платить комиссию
     */
    public async getSponsoredBalances(): Promise<Balance[]> {
        return this.getBalance().then((balance) =>
            balance.filter((item) => !!item.sponsorship)
        );
    }

    // TODO
    // public batch(
    //     txOrList: TTransactionParamWithType | Array<TTransactionParamWithType>
    // ): TActionsApi<TTransactionParamWithType> {
    //     const isOnce = !Array.isArray(txOrList);
    //     const sign = () =>
    //         this._sign(toArray(txOrList)).then((result) =>
    //             isOnce ? result[0] : result
    //         ) as any;
    //     return {
    //         sign,
    //         broadcast: (opt?: Partial<BroadcastOptions>) =>
    //             sign().then((transactions: any) =>
    //                 this.broadcast(transactions, opt)
    //             ),
    //     };
    // }

    public issue(data: IssueArgs): ChainApiFirstCall<SignerIssueTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.ISSUE
        });
    }

    public transfer(data: TransferArgs): ChainApiFirstCall<SignerTransferTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.TRANSFER,
        });
    }

    public reissue(data: ReissueArgs): ChainApiFirstCall<SignerReissueTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.REISSUE,
        });
    }

    public burn(data: BurnArgs): ChainApiFirstCall<SignerBurnTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.BURN,
        });
    }

    public lease(data: LeaseArgs): ChainApiFirstCall<SignerLeaseTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.LEASE,
        });
    }

    public exchange(data: ExchangeArgs): ChainApiFirstCall<SignerExchangeTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.EXCHANGE,
        });
    }

    public cancelLease(
        data: CancelLeaseArgs
    ): ChainApiFirstCall<SignerCancelLeaseTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.CANCEL_LEASE,
        });
    }

    public alias(data: AliasArgs): ChainApiFirstCall<SignerAliasTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.ALIAS,
        });
    }

    public massTransfer(
        data: MassTransferArgs
    ): ChainApiFirstCall<SignerMassTransferTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.MASS_TRANSFER,
        });
    }

    public data(data: DataArgs): ChainApiFirstCall<SignerDataTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.DATA,
        });
    }

    public sponsorship(
        data: SponsorshipArgs
    ): ChainApiFirstCall<SignerSponsorshipTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.SPONSORSHIP,
        });
    }

    public setScript(
        data: SetScriptArgs
    ): ChainApiFirstCall<SignerSetScriptTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.SET_SCRIPT,
        });
    }

    public setAssetScript(
        data: SetAssetScriptArgs
    ): ChainApiFirstCall<SignerAssetScriptTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.SET_ASSET_SCRIPT,
        });
    }

    public invoke(data: InvokeArgs): ChainApiFirstCall<SignerInvokeTx> {
        return this._createPipelineAPI({
            ...data,
            type: TRANSACTION_TYPE.INVOKE_SCRIPT,
        });
    }

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
    public async waitTxConfirm<T extends TTransaction>(
        tx: T | T[],
        confirmations: number
    ): Promise<T | T[]> {
        return wait(this._options.NODE_URL, tx as any, { confirmations }); // TODO Fix types
    }

    private _createPipelineAPI<T extends SignerTx>(
        signerTxList: T
    ): ChainApiFirstCall<T> {
        return {
            ...({
                issue: this.issue.bind(this),
                transfer: this.transfer.bind(this),
                reissue: this.reissue.bind(this),
                burn: this.burn.bind(this),
                lease: this.lease.bind(this),
                exchange: this.exchange.bind(this),
                cancelLease: this.cancelLease.bind(this),
                alias: this.alias.bind(this),
                massTransfer: this.massTransfer.bind(this),
                data: this.data.bind(this),
                sponsorship: this.sponsorship.bind(this),
                setScript: this.setScript.bind(this),
                setAssetScript: this.setAssetScript.bind(this),
                invoke: this.invoke.bind(this),
            } as any),
            sign: async () => this._sign<T>(signerTxList),
            broadcast: async (options?: BroadcastOptions) =>
                this.broadcast<T>(this._sign<T>(signerTxList), options),
        };
    }

    private _sign<T extends SignerTx>(toSign: T): Promise<SignedTx<T>>;
    private async _sign<T extends SignerTx>(
        toSign: T | T[]
    ): Promise<SignedTx<T> | [SignedTx<T>]> {
        return this._connectPromise.then((provider) => provider.sign(toSign));
    }
}

// eslint-disable-next-line import/no-default-export
export default Signer;
