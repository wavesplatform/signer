import { writeFile } from 'fs-extra';
import { join } from 'path';

const GenericNames = ['Q', 'W', 'E', 'R', 'T', 'Y'];

const compile = ({ index, params, returns, actions }: ICompileOptions) => `
export type TTransactionsApi${index}<${params}> = {
    issue(data: IIssue): ${returns('issue')}
    transfer(data: ITransfer): ${returns('transfer')}
    reissue(data: IReissue): ${returns('reissue')}
    burn(data: IBurn): ${returns('burn')}
    lease(data: ILease): ${returns('lease')}
    exchange(data: IExchange): ${returns('exchange')}
    cancelLease(data: ICancelLease): ${returns('cancelLease')}
    alias(data: IAlias): ${returns('alias')}
    massTransfer(data: IMassTransfer): ${returns('massTransfer')}
    data(data: IData): ${returns('data')}
    sponsorship(data: ISponsorship): ${returns('sponsorship')}
    setScript(data: ISetScript): ${returns('setScript')}
    setAssetScript(data: ISetAssetScript): ${returns('setAssetScript')}
    invoke(data: IInvoke): ${returns('invoke')}
} & TActionsApi<${actions}>;
`.trim();

interface ICompileOptions {
    index: number;
    params: string;
    returns: (name: string) => string;
    actions: string;
}

const generate = (generics: Array<string>) => {
    const ext = (letter: string) => `${letter} extends TTransactionParamWithType<TLong>`;
    const nameToType = (name: string) => `I${name.charAt(0).toUpperCase()}${name.slice(1)}WithType`;

    const loop = (names: Array<string>): string => {
        const lastReturns = names.length === generics.length ? `TTransactionsApi${generics.length + 1}<Array<TTransactionParamWithType<TLong>>>` : null;
        const lastActions = names.length === generics.length ? 'Array<TTransactionParamWithType<TLong>>' : null;
        const params: ICompileOptions = {
            index: names.length,
            params: names.map(ext).join(', '),
            returns: name => lastReturns || `TTransactionsApi${names.length + 1}<${names.join(', ')}, ${nameToType(name)}>;`,
            actions: lastActions || `[${names.join(', ')}]`

        };

        if (names.length === 1) {
            return compile(params);
        } else {
            const template = loop(names.slice(0, -1));
            return template + '\n\n' + compile(params);
        }
    };

    return loop(generics) + '\n\n' + compile({
        index: generics.length + 1,
        actions: 'Array<TTransactionParamWithType>',
        params: 'T extends Array<TTransactionParamWithType>',
        returns: () => `TTransactionsApi${generics.length + 1}<T>`
    });
};

writeFile(join(__dirname, 'src/api.ts'), `
import { 
    TTransactionParamWithType,
    TLong,
    IIssue,
    IIssueWithType,
    ITransfer,
    ITransferWithType,
    IReissue,
    IReissueWithType,
    IBurn,
    IBurnWithType,
    ILease,
    ILeaseWithType,
    IExchange,
    IExchangeWithType,
    ICancelLease,
    ICancelLeaseWithType,
    IAlias,
    IAliasWithType,
    IMassTransfer,
    IMassTransferWithType,
    IData,
    IDataWithType,
    ISponsorship,
    ISponsorshipWithType,
    ISetScript,
    ISetScriptWithType,
    ISetAssetScript,
    ISetAssetScriptWithType,
    IInvoke,
    IInvokeWithType,
    TActionsApi
} from './interface';


${generate(GenericNames)}
`).catch(e => {
    console.error(e);
});
