import fetch from 'node-fetch';
import { waitTime } from './utils';

export const NETWORK_BYTE = 87;
export const NODE_URL = 'https://nodes.wavesnodes.com';
export const MOCK_URL = 'https://mock.com';
export const ACCOUNTS = {
    SIMPLE: {
        seed: 'some simple account seed',
    },
    NODE: {
        seed: 'some node mainer seed'
    },
    SMART: {
        seed: 'some smart contract seed'
    }
};

export const SMART_ASSET_SCRIPT = `base64:BAbMtW/U`


const makeResponse = (ok: boolean, data: any) => {
    return {
        ok,
        text: () => Promise.resolve(JSON.stringify(data)),
        json: () => Promise.resolve(data),
    };
};

type Fetch = typeof window.fetch;
// @ts-ignore
const f: Fetch = (url: string, options) => {
    if (!url.includes(MOCK_URL)) {
        return fetch(url, options as any);
    }

    console.log(`Request ${url}, options: ${JSON.stringify(options, null, 4)}`);

    return waitTime(100)
        .then(() => {
            switch (url.replace(MOCK_URL, '')) {
                case '/blocks/headers/last':
                    return makeResponse(true, {
                        'version': 5,
                        'timestamp': 1607356839244,
                        'reference': 'FJTPjM4xdnA9UHzzAvJiQrukQXhLdUqcuGCAHyAG9byv',
                        'nxt-consensus': {
                            'base-target': 65,
                            'generation-signature': '3ePCDAcp4gwu4Ean62Gadq1b8cfiyPS4HcjkNCcbqtnstkgmMxcACy5xKXtvmE8cvuxYCP5up5ySTwBxLEYpdDGxRyS2G39uAKRPk9L7UkhT2NrxgBAp4sFUdKSJCnDVdGN',
                        },
                        'transactionsRoot': 'F29m1msUptvkURdGMfKh5vn4mWcXZ26AjT7rQvEs9G93',
                        'id': 'HUgEdXjzh9eRmmCMbDCUArybD9xTujLu5pHsBiWgMvLS',
                        'features': [],
                        'desiredReward': -1,
                        'generator': '3PMj3yGPBEa1Sx9X4TSBFeJCMMaE3wvKR4N',
                        'generatorPublicKey': 'BDjPpGYcC8ANJSPX7xgprPpp9nioWK6Qpw9PjbekXxav',
                        'signature': '5voKYmNf446S1vjxNi755kpz96dL4JW5csmpKaLrNGg1uKcvFVVDMoFF4cQL3ko71MRHnW5YUTwcZmLb8XFqfjqL',
                        'blocksize': 12134,
                        'transactionCount': 19,
                        'height': 2362163,
                        'totalFee': 6700000,
                        'reward': 600000000,
                        'VRF': 'FW4nZFpq4odLoiuN6ndGNk3w1mEvvJ2zHhv9p3tgyGgZ',
                    });
                case '/transactions/broadcast':
                    return makeResponse(true, JSON.parse(options!.body as string));
            }
        });
};

(global as any).fetch = f;

