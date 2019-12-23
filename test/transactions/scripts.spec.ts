import Waves from '../../src/Waves';
import { TestProvider } from '../TestProvider';
import { wait } from '../utils';
import { DAP_SCRIPT, NODE_URL, SMART_ASSET_SCRIPT, STATE } from '../_state';

const { ACCOUNTS } = STATE;


const waves = new Waves({ NODE_URL: NODE_URL });
const provider = new TestProvider(ACCOUNTS.FOR_SCRIPT.seed);
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
        .then(([tx]) =>
            wait(tx).then(() => tx)
        );

it('Remove Account Script', async () => {
    const [tx] = await waves
        .setScript({
            script: null,
            fee: 1400000
        })
        .broadcast();

    await wait(tx);
});

it('Set Account Script', async () => {
    const [tx] = await waves
        .setScript({
            script: DAP_SCRIPT,
            fee: 1400000
        })
        .broadcast();

    await wait(tx);
});

it('Set Asset Script', async () => {
    const asset = await issue;
    const [tx] = await waves
        .setAssetScript({
            assetId: asset.id,
            script: SMART_ASSET_SCRIPT,
            fee: 100400000
        })
        .broadcast();

    await wait(tx);
});

it('Invoke', async () => {
    const [tx] = await waves
        .invoke({
            dApp: ACCOUNTS.FOR_SCRIPT.address,
            call: {
                function: 'foo',
                args: []
            },
            fee: Math.ceil(0.009 * Math.pow(10, 8))
        })
        .broadcast();

    await wait(tx);
});
