import {
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
    SignerSetScriptTx,
    SignerAssetScriptTx,
    SignerInvokeTx,
    IssueArgs,
    TransferArgs,
    ReissueArgs,
    BurnArgs,
    LeaseArgs,
    ExchangeArgs,
    CancelLeaseArgs,
    AliasArgs,
    MassTransferArgs,
    DataArgs,
    SponsorshipArgs,
    SetScriptArgs,
    SetAssetScriptArgs,
    InvokeArgs,
    BroadcastOptions,
} from '.';

import {
    TSignedTransaction,
    TIssueTransaction,
    TTransferTransaction,
    TReissueTransaction,
    TBurnTransaction,
    TLeaseTransaction,
    TExchangeTransaction,
    TCancelLeaseTransaction,
    TAliasTransaction,
    TMassTransferTransaction,
    TDataTransaction,
    TSponsorshipTransaction,
    TSetAssetScriptTransaction,
    TInvokeScriptTransaction,
    IWithApiMixin,
} from '@waves/ts-types';

// Мапит транзакцию сайнера в транзакцию из @waves/ts-types
type SignerTxToTx<T> = T extends SignerTx
    ? T extends SignerIssueTx
        ? TIssueTransaction
        : T extends SignerTransferTx
        ? TTransferTransaction
        : T extends SignerReissueTx
        ? TReissueTransaction
        : T extends SignerBurnTx
        ? TBurnTransaction
        : T extends SignerLeaseTx
        ? TLeaseTransaction
        : T extends SignerExchangeTx
        ? TExchangeTransaction
        : T extends SignerCancelLeaseTx
        ? TCancelLeaseTransaction
        : T extends SignerAliasTx
        ? TAliasTransaction
        : T extends SignerMassTransferTx
        ? TMassTransferTransaction
        : T extends SignerDataTx
        ? TDataTransaction
        : T extends SignerSponsorshipTx
        ? TSponsorshipTransaction
        : T extends SignerSetScriptTx
        ? TSetAssetScriptTransaction
        : T extends SignerAssetScriptTx
        ? TSetAssetScriptTransaction
        // : T extends SignerInvokeTx
        // ? TInvokeScriptTransaction
        : never
    : never;

export type SignedTx<T> = T extends SignerTx[]
    ? {
        // Пришлось вытащить кейс с инвоком из SignerTxToTx, т.к. с ним тс ругается на слишком большой нестинг типов
        [P in keyof T]: T[P] extends TInvokeScriptTransaction ?
            TSignedTransaction<TInvokeScriptTransaction> :
            TSignedTransaction<SignerTxToTx<T[P]>>
      }
    : T extends SignerTx
    ? TSignedTransaction<SignerTxToTx<T>>
    : never;

export type ChainApiFirstCall<Q extends SignerTx> = {
    issue(data: IssueArgs): ChainApiSecondCall<Q, SignerIssueTx>;
    transfer(data: TransferArgs): ChainApiSecondCall<Q, SignerTransferTx>;
    reissue(data: ReissueArgs): ChainApiSecondCall<Q, SignerReissueTx>;
    burn(data: BurnArgs): ChainApiSecondCall<Q, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApiSecondCall<Q, SignerLeaseTx>;
    exchange(data: ExchangeArgs): ChainApiSecondCall<Q, SignerExchangeTx>;
    cancelLease(
        data: CancelLeaseArgs
    ): ChainApiSecondCall<Q, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApiSecondCall<Q, SignerAliasTx>;
    massTransfer(
        data: MassTransferArgs
    ): ChainApiSecondCall<Q, SignerMassTransferTx>;
    data(data: DataArgs): ChainApiSecondCall<Q, SignerDataTx>;
    sponsorship(
        data: SponsorshipArgs
    ): ChainApiSecondCall<Q, SignerSponsorshipTx>;
    setScript(data: SetScriptArgs): ChainApiSecondCall<Q, SignerSetScriptTx>;
    setAssetScript(
        data: SetAssetScriptArgs
    ): ChainApiSecondCall<Q, SignerAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApiSecondCall<Q, SignerInvokeTx>;
    sign(): Promise<SignedTx<Q>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<Q>>>;
};
export type ChainApiSecondCall<Q extends SignerTx, W extends SignerTx> = {
    issue(data: IssueArgs): ChainApiThirdCall<Q, W, SignerIssueTx>;
    transfer(data: TransferArgs): ChainApiThirdCall<Q, W, SignerTransferTx>;
    reissue(data: ReissueArgs): ChainApiThirdCall<Q, W, SignerReissueTx>;
    burn(data: BurnArgs): ChainApiThirdCall<Q, W, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApiThirdCall<Q, W, SignerLeaseTx>;
    exchange(data: ExchangeArgs): ChainApiThirdCall<Q, W, SignerExchangeTx>;
    cancelLease(
        data: CancelLeaseArgs
    ): ChainApiThirdCall<Q, W, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApiThirdCall<Q, W, SignerAliasTx>;
    massTransfer(
        data: MassTransferArgs
    ): ChainApiThirdCall<Q, W, SignerMassTransferTx>;
    data(data: DataArgs): ChainApiThirdCall<Q, W, SignerDataTx>;
    sponsorship(
        data: SponsorshipArgs
    ): ChainApiThirdCall<Q, W, SignerSponsorshipTx>;
    setScript(data: SetScriptArgs): ChainApiThirdCall<Q, W, SignerSetScriptTx>;
    setAssetScript(
        data: SetAssetScriptArgs
    ): ChainApiThirdCall<Q, W, SignerAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApiThirdCall<Q, W, SignerInvokeTx>;
    sign(): Promise<SignedTx<[Q, W]>>;
    broadcast(
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<[Q, W]>>>;
};
export type ChainApiThirdCall<
    Q extends SignerTx,
    W extends SignerTx,
    E extends SignerTx
> = {
    issue(data: IssueArgs): ChainApiFourthCall<Q, W, E, SignerIssueTx>;
    transfer(data: TransferArgs): ChainApiFourthCall<Q, W, E, SignerTransferTx>;
    reissue(data: ReissueArgs): ChainApiFourthCall<Q, W, E, SignerReissueTx>;
    burn(data: BurnArgs): ChainApiFourthCall<Q, W, E, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApiFourthCall<Q, W, E, SignerLeaseTx>;
    exchange(data: ExchangeArgs): ChainApiFourthCall<Q, W, E, SignerExchangeTx>;
    cancelLease(
        data: CancelLeaseArgs
    ): ChainApiFourthCall<Q, W, E, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApiFourthCall<Q, W, E, SignerAliasTx>;
    massTransfer(
        data: MassTransferArgs
    ): ChainApiFourthCall<Q, W, E, SignerMassTransferTx>;
    data(data: DataArgs): ChainApiFourthCall<Q, W, E, SignerDataTx>;
    sponsorship(
        data: SponsorshipArgs
    ): ChainApiFourthCall<Q, W, E, SignerSponsorshipTx>;
    setScript(
        data: SetScriptArgs
    ): ChainApiFourthCall<Q, W, E, SignerSetScriptTx>;
    setAssetScript(
        data: SetAssetScriptArgs
    ): ChainApiFourthCall<Q, W, E, SignerAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApiFourthCall<Q, W, E, SignerInvokeTx>;
    sign(): Promise<SignedTx<[Q, W, E]>>;
    broadcast(
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<[Q, W, E]>>>;
};
export type ChainApiFourthCall<
    Q extends SignerTx,
    W extends SignerTx,
    E extends SignerTx,
    R extends SignerTx
> = {
    issue(data: IssueArgs): ChainApiFifthCall<Q, W, E, R, SignerIssueTx>;
    transfer(
        data: TransferArgs
    ): ChainApiFifthCall<Q, W, E, R, SignerTransferTx>;
    reissue(data: ReissueArgs): ChainApiFifthCall<Q, W, E, R, SignerReissueTx>;
    burn(data: BurnArgs): ChainApiFifthCall<Q, W, E, R, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApiFifthCall<Q, W, E, R, SignerLeaseTx>;
    exchange(
        data: ExchangeArgs
    ): ChainApiFifthCall<Q, W, E, R, SignerExchangeTx>;
    cancelLease(
        data: CancelLeaseArgs
    ): ChainApiFifthCall<Q, W, E, R, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApiFifthCall<Q, W, E, R, SignerAliasTx>;
    massTransfer(
        data: MassTransferArgs
    ): ChainApiFifthCall<Q, W, E, R, SignerMassTransferTx>;
    data(data: DataArgs): ChainApiFifthCall<Q, W, E, R, SignerDataTx>;
    sponsorship(
        data: SponsorshipArgs
    ): ChainApiFifthCall<Q, W, E, R, SignerSponsorshipTx>;
    setScript(
        data: SetScriptArgs
    ): ChainApiFifthCall<Q, W, E, R, SignerSetScriptTx>;
    setAssetScript(
        data: SetAssetScriptArgs
    ): ChainApiFifthCall<Q, W, E, R, SignerAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApiFifthCall<Q, W, E, R, SignerInvokeTx>;
    sign(): Promise<SignedTx<[Q, W, E, R]>>;
    broadcast(
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<[Q, W, E, R]>>>;
};
export type ChainApiFifthCall<
    Q extends SignerTx,
    W extends SignerTx,
    E extends SignerTx,
    R extends SignerTx,
    T extends SignerTx
> = {
    issue(data: IssueArgs): ChainApiSixthCall<Q, W, E, R, T, SignerIssueTx>;
    transfer(
        data: TransferArgs
    ): ChainApiSixthCall<Q, W, E, R, T, SignerTransferTx>;
    reissue(
        data: ReissueArgs
    ): ChainApiSixthCall<Q, W, E, R, T, SignerReissueTx>;
    burn(data: BurnArgs): ChainApiSixthCall<Q, W, E, R, T, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApiSixthCall<Q, W, E, R, T, SignerLeaseTx>;
    exchange(
        data: ExchangeArgs
    ): ChainApiSixthCall<Q, W, E, R, T, SignerExchangeTx>;
    cancelLease(
        data: CancelLeaseArgs
    ): ChainApiSixthCall<Q, W, E, R, T, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApiSixthCall<Q, W, E, R, T, SignerAliasTx>;
    massTransfer(
        data: MassTransferArgs
    ): ChainApiSixthCall<Q, W, E, R, T, SignerMassTransferTx>;
    data(data: DataArgs): ChainApiSixthCall<Q, W, E, R, T, SignerDataTx>;
    sponsorship(
        data: SponsorshipArgs
    ): ChainApiSixthCall<Q, W, E, R, T, SignerSponsorshipTx>;
    setScript(
        data: SetScriptArgs
    ): ChainApiSixthCall<Q, W, E, R, T, SignerSetScriptTx>;
    setAssetScript(
        data: SetAssetScriptArgs
    ): ChainApiSixthCall<Q, W, E, R, T, SignerAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApiSixthCall<Q, W, E, R, T, SignerInvokeTx>;
    sign(): Promise<SignedTx<[Q, W, E, R, T]>>;
    broadcast(
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<[Q, W, E, R, T]>>>;
};
export type ChainApiSixthCall<
    Q extends SignerTx,
    W extends SignerTx,
    E extends SignerTx,
    R extends SignerTx,
    T extends SignerTx,
    Y extends SignerTx
> = {
    issue(data: IssueArgs): ChainApiSeventhCall<SignerTx[]>;
    transfer(data: TransferArgs): ChainApiSeventhCall<SignerTx[]>;
    reissue(data: ReissueArgs): ChainApiSeventhCall<SignerTx[]>;
    burn(data: BurnArgs): ChainApiSeventhCall<SignerTx[]>;
    lease(data: LeaseArgs): ChainApiSeventhCall<SignerTx[]>;
    exchange(data: ExchangeArgs): ChainApiSeventhCall<SignerTx[]>;
    cancelLease(data: CancelLeaseArgs): ChainApiSeventhCall<SignerTx[]>;
    alias(data: AliasArgs): ChainApiSeventhCall<SignerTx[]>;
    massTransfer(data: MassTransferArgs): ChainApiSeventhCall<SignerTx[]>;
    data(data: DataArgs): ChainApiSeventhCall<SignerTx[]>;
    sponsorship(data: SponsorshipArgs): ChainApiSeventhCall<SignerTx[]>;
    setScript(data: SetScriptArgs): ChainApiSeventhCall<SignerTx[]>;
    setAssetScript(data: SetAssetScriptArgs): ChainApiSeventhCall<SignerTx[]>;
    invoke(data: InvokeArgs): ChainApiSeventhCall<SignerTx[]>;
    sign(): Promise<SignedTx<[Q, W, E, R, T, Y]>>;
    broadcast(
        options?: BroadcastOptions
    ): Promise<BroadcastedTx<SignedTx<[Q, W, E, R, T, Y]>>>;
};
export type ChainApiSeventhCall<Q extends SignerTx[]> = {
    issue(data: IssueArgs): ChainApiSeventhCall<Q>;
    transfer(data: TransferArgs): ChainApiSeventhCall<Q>;
    reissue(data: ReissueArgs): ChainApiSeventhCall<Q>;
    burn(data: BurnArgs): ChainApiSeventhCall<Q>;
    lease(data: LeaseArgs): ChainApiSeventhCall<Q>;
    exchange(data: ExchangeArgs): ChainApiSeventhCall<Q>;
    cancelLease(data: CancelLeaseArgs): ChainApiSeventhCall<Q>;
    alias(data: AliasArgs): ChainApiSeventhCall<Q>;
    massTransfer(data: MassTransferArgs): ChainApiSeventhCall<Q>;
    data(data: DataArgs): ChainApiSeventhCall<Q>;
    sponsorship(data: SponsorshipArgs): ChainApiSeventhCall<Q>;
    setScript(data: SetScriptArgs): ChainApiSeventhCall<Q>;
    setAssetScript(data: SetAssetScriptArgs): ChainApiSeventhCall<Q>;
    invoke(data: InvokeArgs): ChainApiSeventhCall<Q>;
    sign(): Promise<SignedTx<Q>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<Q>>>;
};

export type BroadcastedTx<T> = T extends SignedTx<SignerTx>[]
    ? { [P in keyof T]: T[P] & IWithApiMixin }
    : T extends SignedTx<SignerTx>
    ? T & IWithApiMixin
    : never;
