
import {
    BroadcastOptions,
    SignerTx,
    SignedTx,
    BroadcastedTx,
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
    SignerSetAssetScriptTx,
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
    InvokeArgs
} from '.';

export type ChainApi1stCall<Q extends SignerTx> = {
    issue(data: IssueArgs): ChainApi2ndCall<Q, SignerIssueTx>;
    transfer(data: TransferArgs): ChainApi2ndCall<Q, SignerTransferTx>;
    reissue(data: ReissueArgs): ChainApi2ndCall<Q, SignerReissueTx>;
    burn(data: BurnArgs): ChainApi2ndCall<Q, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApi2ndCall<Q, SignerLeaseTx>;
    exchange(data: ExchangeArgs): ChainApi2ndCall<Q, SignerExchangeTx>;
    cancelLease(data: CancelLeaseArgs): ChainApi2ndCall<Q, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApi2ndCall<Q, SignerAliasTx>;
    massTransfer(data: MassTransferArgs): ChainApi2ndCall<Q, SignerMassTransferTx>;
    data(data: DataArgs): ChainApi2ndCall<Q, SignerDataTx>;
    sponsorship(data: SponsorshipArgs): ChainApi2ndCall<Q, SignerSponsorshipTx>;
    setScript(data: SetScriptArgs): ChainApi2ndCall<Q, SignerSetScriptTx>;
    setAssetScript(data: SetAssetScriptArgs): ChainApi2ndCall<Q, SignerSetAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApi2ndCall<Q, SignerInvokeTx>;
    sign(): Promise<SignedTx<Q>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<Q>>>;
};
export type ChainApi2ndCall<Q extends SignerTx, W extends SignerTx> = {
    issue(data: IssueArgs): ChainApi3rdCall<Q, W, SignerIssueTx>;
    transfer(data: TransferArgs): ChainApi3rdCall<Q, W, SignerTransferTx>;
    reissue(data: ReissueArgs): ChainApi3rdCall<Q, W, SignerReissueTx>;
    burn(data: BurnArgs): ChainApi3rdCall<Q, W, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApi3rdCall<Q, W, SignerLeaseTx>;
    exchange(data: ExchangeArgs): ChainApi3rdCall<Q, W, SignerExchangeTx>;
    cancelLease(data: CancelLeaseArgs): ChainApi3rdCall<Q, W, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApi3rdCall<Q, W, SignerAliasTx>;
    massTransfer(data: MassTransferArgs): ChainApi3rdCall<Q, W, SignerMassTransferTx>;
    data(data: DataArgs): ChainApi3rdCall<Q, W, SignerDataTx>;
    sponsorship(data: SponsorshipArgs): ChainApi3rdCall<Q, W, SignerSponsorshipTx>;
    setScript(data: SetScriptArgs): ChainApi3rdCall<Q, W, SignerSetScriptTx>;
    setAssetScript(data: SetAssetScriptArgs): ChainApi3rdCall<Q, W, SignerSetAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApi3rdCall<Q, W, SignerInvokeTx>;
    sign(): Promise<SignedTx<[Q, W]>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<[Q, W]>>>;
};
export type ChainApi3rdCall<Q extends SignerTx, W extends SignerTx, E extends SignerTx> = {
    issue(data: IssueArgs): ChainApi4thCall<Q, W, E, SignerIssueTx>;
    transfer(data: TransferArgs): ChainApi4thCall<Q, W, E, SignerTransferTx>;
    reissue(data: ReissueArgs): ChainApi4thCall<Q, W, E, SignerReissueTx>;
    burn(data: BurnArgs): ChainApi4thCall<Q, W, E, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApi4thCall<Q, W, E, SignerLeaseTx>;
    exchange(data: ExchangeArgs): ChainApi4thCall<Q, W, E, SignerExchangeTx>;
    cancelLease(data: CancelLeaseArgs): ChainApi4thCall<Q, W, E, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApi4thCall<Q, W, E, SignerAliasTx>;
    massTransfer(data: MassTransferArgs): ChainApi4thCall<Q, W, E, SignerMassTransferTx>;
    data(data: DataArgs): ChainApi4thCall<Q, W, E, SignerDataTx>;
    sponsorship(data: SponsorshipArgs): ChainApi4thCall<Q, W, E, SignerSponsorshipTx>;
    setScript(data: SetScriptArgs): ChainApi4thCall<Q, W, E, SignerSetScriptTx>;
    setAssetScript(data: SetAssetScriptArgs): ChainApi4thCall<Q, W, E, SignerSetAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApi4thCall<Q, W, E, SignerInvokeTx>;
    sign(): Promise<SignedTx<[Q, W, E]>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<[Q, W, E]>>>;
};
export type ChainApi4thCall<Q extends SignerTx, W extends SignerTx, E extends SignerTx, R extends SignerTx> = {
    issue(data: IssueArgs): ChainApi5thCall<Q, W, E, R, SignerIssueTx>;
    transfer(data: TransferArgs): ChainApi5thCall<Q, W, E, R, SignerTransferTx>;
    reissue(data: ReissueArgs): ChainApi5thCall<Q, W, E, R, SignerReissueTx>;
    burn(data: BurnArgs): ChainApi5thCall<Q, W, E, R, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApi5thCall<Q, W, E, R, SignerLeaseTx>;
    exchange(data: ExchangeArgs): ChainApi5thCall<Q, W, E, R, SignerExchangeTx>;
    cancelLease(data: CancelLeaseArgs): ChainApi5thCall<Q, W, E, R, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApi5thCall<Q, W, E, R, SignerAliasTx>;
    massTransfer(data: MassTransferArgs): ChainApi5thCall<Q, W, E, R, SignerMassTransferTx>;
    data(data: DataArgs): ChainApi5thCall<Q, W, E, R, SignerDataTx>;
    sponsorship(data: SponsorshipArgs): ChainApi5thCall<Q, W, E, R, SignerSponsorshipTx>;
    setScript(data: SetScriptArgs): ChainApi5thCall<Q, W, E, R, SignerSetScriptTx>;
    setAssetScript(data: SetAssetScriptArgs): ChainApi5thCall<Q, W, E, R, SignerSetAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApi5thCall<Q, W, E, R, SignerInvokeTx>;
    sign(): Promise<SignedTx<[Q, W, E, R]>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<[Q, W, E, R]>>>;
};
export type ChainApi5thCall<Q extends SignerTx, W extends SignerTx, E extends SignerTx, R extends SignerTx, T extends SignerTx> = {
    issue(data: IssueArgs): ChainApi6thCall<Q, W, E, R, T, SignerIssueTx>;
    transfer(data: TransferArgs): ChainApi6thCall<Q, W, E, R, T, SignerTransferTx>;
    reissue(data: ReissueArgs): ChainApi6thCall<Q, W, E, R, T, SignerReissueTx>;
    burn(data: BurnArgs): ChainApi6thCall<Q, W, E, R, T, SignerBurnTx>;
    lease(data: LeaseArgs): ChainApi6thCall<Q, W, E, R, T, SignerLeaseTx>;
    exchange(data: ExchangeArgs): ChainApi6thCall<Q, W, E, R, T, SignerExchangeTx>;
    cancelLease(data: CancelLeaseArgs): ChainApi6thCall<Q, W, E, R, T, SignerCancelLeaseTx>;
    alias(data: AliasArgs): ChainApi6thCall<Q, W, E, R, T, SignerAliasTx>;
    massTransfer(data: MassTransferArgs): ChainApi6thCall<Q, W, E, R, T, SignerMassTransferTx>;
    data(data: DataArgs): ChainApi6thCall<Q, W, E, R, T, SignerDataTx>;
    sponsorship(data: SponsorshipArgs): ChainApi6thCall<Q, W, E, R, T, SignerSponsorshipTx>;
    setScript(data: SetScriptArgs): ChainApi6thCall<Q, W, E, R, T, SignerSetScriptTx>;
    setAssetScript(data: SetAssetScriptArgs): ChainApi6thCall<Q, W, E, R, T, SignerSetAssetScriptTx>;
    invoke(data: InvokeArgs): ChainApi6thCall<Q, W, E, R, T, SignerInvokeTx>;
    sign(): Promise<SignedTx<[Q, W, E, R, T]>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<[Q, W, E, R, T]>>>;
};
export type ChainApi6thCall<Q extends SignerTx, W extends SignerTx, E extends SignerTx, R extends SignerTx, T extends SignerTx, Y extends SignerTx> = {
    issue(data: IssueArgs): ChainApi7thCall<SignerTx[]>;
    transfer(data: TransferArgs): ChainApi7thCall<SignerTx[]>;
    reissue(data: ReissueArgs): ChainApi7thCall<SignerTx[]>;
    burn(data: BurnArgs): ChainApi7thCall<SignerTx[]>;
    lease(data: LeaseArgs): ChainApi7thCall<SignerTx[]>;
    exchange(data: ExchangeArgs): ChainApi7thCall<SignerTx[]>;
    cancelLease(data: CancelLeaseArgs): ChainApi7thCall<SignerTx[]>;
    alias(data: AliasArgs): ChainApi7thCall<SignerTx[]>;
    massTransfer(data: MassTransferArgs): ChainApi7thCall<SignerTx[]>;
    data(data: DataArgs): ChainApi7thCall<SignerTx[]>;
    sponsorship(data: SponsorshipArgs): ChainApi7thCall<SignerTx[]>;
    setScript(data: SetScriptArgs): ChainApi7thCall<SignerTx[]>;
    setAssetScript(data: SetAssetScriptArgs): ChainApi7thCall<SignerTx[]>;
    invoke(data: InvokeArgs): ChainApi7thCall<SignerTx[]>;
    sign(): Promise<SignedTx<[Q, W, E, R, T, Y]>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<[Q, W, E, R, T, Y]>>>;
};
export type ChainApi7thCall<Q extends SignerTx[]> = {
    issue(data: IssueArgs): ChainApi7thCall<Q>;
    transfer(data: TransferArgs): ChainApi7thCall<Q>;
    reissue(data: ReissueArgs): ChainApi7thCall<Q>;
    burn(data: BurnArgs): ChainApi7thCall<Q>;
    lease(data: LeaseArgs): ChainApi7thCall<Q>;
    exchange(data: ExchangeArgs): ChainApi7thCall<Q>;
    cancelLease(data: CancelLeaseArgs): ChainApi7thCall<Q>;
    alias(data: AliasArgs): ChainApi7thCall<Q>;
    massTransfer(data: MassTransferArgs): ChainApi7thCall<Q>;
    data(data: DataArgs): ChainApi7thCall<Q>;
    sponsorship(data: SponsorshipArgs): ChainApi7thCall<Q>;
    setScript(data: SetScriptArgs): ChainApi7thCall<Q>;
    setAssetScript(data: SetAssetScriptArgs): ChainApi7thCall<Q>;
    invoke(data: InvokeArgs): ChainApi7thCall<Q>;
    sign(): Promise<SignedTx<Q>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<Q>>>;
};

