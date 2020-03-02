import { writeFile } from 'fs-extra';
import { join } from 'path';

const config = {
    genericNames: ['Q', 'W', 'E', 'R', 'T', 'Y'], // generate typings for length(genericNames) chained api calls
    signerTxType: 'SignerTx',
    signerTxTypePrefix: 'Signer',
    signerTxTypeSuffix: 'Tx',
    signedTxType: 'SignedTx',
    boradcastedTxType: 'BroadcastedTx',
    apiMethods: [
        'issue',
        'transfer',
        'reissue',
        'burn',
        'lease',
        'exchange',
        'cancelLease',
        'alias',
        'massTransfer',
        'data',
        'sponsorship',
        'setScript',
        'setAssetScript',
        'invoke',
    ],
    indentation: 4
};

const indentLeft = (str: string): string => `${' '.repeat(config.indentation)}${str}`;

const capitalize = (str: string): string =>
    `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

// generates name for n-th api type
// example: `ChainApi1stCall`
const generateTypeName = (nthApiCall: number): string => {
    const s =
        nthApiCall === 1
            ? '1st'
            : nthApiCall === 2
            ? '2nd'
            : nthApiCall === 3
            ? '3rd'
            : `${nthApiCall}th`;

    return `ChainApi${s}Call`;
};

// generates type for chained api
// example: `export type ChainApiSecondCall<Q extends SignerTx, W extends SignerTx> = {`
const generateTypeHead = (nthApiCall: number, max: number) => {
    const generateGenericConstrait = (genericName: string) => {
        return `${genericName} extends ${config.signerTxType}${
            nthApiCall < max ? '' : '[]'
        }`;
    };

    const apiCallname = generateTypeName(nthApiCall);

    if (nthApiCall < max) {
        const generics = config.genericNames.slice(0, nthApiCall);

        return `export type ${apiCallname}<${generics
            .map(generateGenericConstrait)
            .join(', ')}> = {`;
    } else {
        return `export type ${apiCallname}<${generateGenericConstrait(
            config.genericNames[0]
        )}> = {`;
    }
};

// generates return type for api method
// example: `ChainApiSecondCall<Q, SignerIssueTx>`
const generateReturnType = (
    methodName: string,
    nthApiCall: number,
    max: number
): string => {
    const signerTxType = `${config.signerTxTypePrefix}${capitalize(
        methodName
    )}${config.signerTxTypeSuffix}`;

    if (nthApiCall < max - 1) {
        const generics = config.genericNames.slice(0, nthApiCall).join(', ');

        return `${generateTypeName(
            nthApiCall + 1
        )}<${generics}, ${signerTxType}>`;
    } else if (nthApiCall === max - 1) {
        return `${generateTypeName(nthApiCall + 1)}<${
            config.signerTxType
        }[]>`;
    } else {
        return `${generateTypeName(nthApiCall)}<${
            config.genericNames[0]
        }>`;
    }
};

// generates api method type
// example: `issue(data: IssueArgs): ChainApi2ndCall<Q, SignerIssueTx>`
const generateMethodType = (
    methodName: string,
    nthApiCall: number,
    max: number
) =>
    `${methodName}(data: ${capitalize(
        methodName
    )}Args): ${generateReturnType(methodName, nthApiCall, max)};`;

const wrapBrackets = (str: string, nthApiCall: number, max: number) => {
    return nthApiCall > 1 && nthApiCall < max ? `[${str}]` : str;
};

// generates sign api method type
// example: `sign(): Promise<SignedTx<[Q, W]>>;`
const generateSignType = (nthApiCall: number, max: number): string => {
    if (nthApiCall < max) {
        const generics = config.genericNames.slice(0, nthApiCall).join(', ');

        return `sign(): Promise<${config.signedTxType}<${wrapBrackets(
            generics,
            nthApiCall,
            max
        )}>>;`;
    } else {
        return `sign(): Promise<${config.signedTxType}<${config.genericNames[0]}>>;`;
    }
};

// generates broadcast api method type
// example: `broadcast(options?: BroadcastOptions): Promise<BroadcastedTx<SignedTx<[Q, W]>>>;`
const generateBroadcastType = (nthApiCall: number, max: number): string => {
    if (nthApiCall < max) {
        const generics = config.genericNames.slice(0, nthApiCall).join(', ');

        return `broadcast(options?: BroadcastOptions): Promise<${
            config.boradcastedTxType
        }<${config.signedTxType}<${wrapBrackets(
            generics,
            nthApiCall,
            max
        )}>>>;`;
    } else {
        return `broadcast(options?: BroadcastOptions): Promise<${config.boradcastedTxType}<${config.signedTxType}<${config.genericNames[0]}>>>;`;
    }
};

// generates chained api types
const generateApiTypes = () => {
    let generatedApiTypes = '';

    const max = config.genericNames.length + 1;

    for (let nthApiCall = 1; nthApiCall <= max; nthApiCall += 1) {
        const signerMethodsTypes = config.apiMethods
            .map(
                (methodName) =>
                    `${indentLeft(
                        generateMethodType(methodName, nthApiCall, max)
                    )}\n`
            )
            .join('');

        let type =
            `${generateTypeHead(nthApiCall, max)}\n` +
            signerMethodsTypes +
            `${indentLeft(generateSignType(nthApiCall, max))}\n` +
            `${indentLeft(generateBroadcastType(nthApiCall, max))}\n};\n`;

        generatedApiTypes = `${generatedApiTypes}${type}`;
    }

    return generatedApiTypes;
};

writeFile(
    join(__dirname, 'src/types/api.ts'),
    `
import {
    BroadcastOptions,
    ${config.signerTxType},
    ${config.signedTxType},
    ${config.boradcastedTxType},
    ${config.apiMethods
        .map(
            (methodName) =>
                `${config.signerTxTypePrefix}${capitalize(methodName)}${
                    config.signerTxTypeSuffix
                }`
        )
        .join(',\n    ')},
    ${config.apiMethods
        .map((methodName) => `${capitalize(methodName)}Args`)
        .join(',\n    ')}
} from '.';

${generateApiTypes()}
`
).catch((e) => {
    console.error(e);
});
