import {
    ACCOUNTS,
    MOCK_URL,
    NETWORK_BYTE,
    SMART_ASSET_SCRIPT,
} from '../test-env';
import Signer from '../../src/Signer';
import { TestProvider } from '../TestProvider';
import { libs } from '@waves/waves-transactions';


const waves = new Signer({ NODE_URL: MOCK_URL });
const provider = new TestProvider(ACCOUNTS.SMART.seed);
waves.setProvider(provider);

const issue =
    waves
        .issue({
            name: 'Test',
            description: 'Test description',
            quantity: 100,
            decimals: 0,
            reissuable: false,
            script: SMART_ASSET_SCRIPT,
            fee: 1.004 * Math.pow(10, 8)
        })
        .broadcast()
        .then(([tx]) => tx);

it('Remove Account Script', async () => {
    await waves
        .setScript({
            script: null,
            fee: 1400000
        })
        .broadcast();
});

it('Set Account Script', async () => {
    await waves
        .setScript({
            script: SMART_ASSET_SCRIPT,
            fee: 1400000
        })
        .broadcast();
});

it('Set Asset Script', async () => {
    const asset = await issue;
    await waves
        .setAssetScript({
            assetId: asset.id,
            script: SMART_ASSET_SCRIPT,
            fee: 100400000
        })
        .broadcast()
        .catch(e => {
            console.error(e.toString());
            return Promise.reject(e);
        });
});

it('Invoke', async () => {
    await waves
        .invoke({
            dApp: libs.crypto.address(ACCOUNTS.SMART.seed, NETWORK_BYTE),
            call: {
                function: 'foo',
                args: []
            },
            fee: Math.ceil(0.009 * Math.pow(10, 8))
        })
        .broadcast();
});
