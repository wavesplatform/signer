import { writeFile } from 'fs-extra';
import { join } from 'path';

const config = {
    genericNames: ['Q', 'W', 'E', 'R', 'T', 'Y'],
};

const capitalize = (str: string): string =>
    `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const numToNth = (nthApiCall: number): string => {
    return nthApiCall === 1
        ? '1st'
        : nthApiCall === 2
        ? '2nd'
        : nthApiCall === 3
        ? '3rd'
        : `${nthApiCall}th`;
};

type HelperArgs = {
    isFirstCall: boolean;
    isPenultimateCall: boolean;
    isLastCall: boolean;
    generics: string[];
};

const generateReturnType = ({
    isFirstCall,
    isPenultimateCall,
    isLastCall,
    generics,
}: HelperArgs) => (methodName: string): string => {
    const signerTxType = `Signer${capitalize(methodName)}Tx`;

    if (isFirstCall) {
        // первый вызов
        return `${generics[0]}, ${signerTxType}`;
    } else if (isPenultimateCall) {
        // предпоследний вызов
        return 'SignerTx[]';
    } else if (isLastCall) {
        // последний вызов
        return generics[0];
    } else {
        // вызовы 2..max-1
        return `${generics.join(', ')}, ${signerTxType}`;
    }
};

const compile = (currCall: number, max: number): string => {
    const isLastCall = currCall === max;
    const isFirstCall = currCall === 1;
    const generics = config.genericNames.slice(0, currCall);

    const curr = `ChainApi${numToNth(currCall)}Call`;
    const next = isLastCall
        ? `ChainApi${numToNth(currCall)}Call`
        : `ChainApi${numToNth(currCall + 1)}Call`;

    const params = generics
        .slice(0, isLastCall ? 1 : currCall)
        .map((g) => `${g} extends SignerTx${isLastCall ? '[]' : ''}`)
        .join(', ');

    let signBroadcastGenerics = generics[0];

    if (!isLastCall) {
        const genericsStr = generics.join(', ');

        signBroadcastGenerics = `[${genericsStr}]`;
    }

    const returns = generateReturnType({
        isFirstCall,
        isLastCall,
        isPenultimateCall: currCall === max - 1,
        generics,
    });

    return `
export type ${curr}<${params}> = {
    issue(data: IssueArgs): ${next}<${returns('issue')}>;
    transfer(data: TransferArgs): ${next}<${returns('transfer')}>;
    reissue(data: ReissueArgs): ${next}<${returns('reissue')}>;
    burn(data: BurnArgs): ${next}<${returns('burn')}>;
    lease(data: LeaseArgs): ${next}<${returns('lease')}>;
    exchange(data: ExchangeArgs): ${next}<${returns('exchange')}>;
    cancelLease(data: CancelLeaseArgs): ${next}<${returns('cancelLease')}>;
    alias(data: AliasArgs): ${next}<${returns('alias')}>;
    massTransfer(data: MassTransferArgs): ${next}<${returns('massTransfer')}>;
    data(data: DataArgs): ${next}<${returns('data')}>;
    sponsorship(data: SponsorshipArgs): ${next}<${returns('sponsorship')}>;
    setScript(data: SetScriptArgs): ${next}<${returns('setScript')}>;
    setAssetScript(data: SetAssetScriptArgs): ${next}<${returns(
        'setAssetScript'
    )}>;
    invoke(data: InvokeArgs): ${next}<${returns('invoke')}>;
    sign(): Promise<SignedTx<${signBroadcastGenerics}>>;
    broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<${signBroadcastGenerics}>>>;
};
`.trim();
};

const generateApiTypes = (): string => {
    let apiTypes = '';

    const max = config.genericNames.length + 1;

    for (let currCall = 1; currCall <= max; currCall += 1) {
        apiTypes = `${apiTypes}\n${compile(currCall, max)}`;
    }

    return apiTypes;
};

writeFile(
    join(__dirname, 'src/types/api.ts'),
    `
/* prettier-ignore */
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

${generateApiTypes()}
`
).catch((e) => {
    console.error(e);
});
