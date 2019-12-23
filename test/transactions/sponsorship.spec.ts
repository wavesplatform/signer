import Waves from '../../src/Waves';
import { TestProvider } from '../TestProvider';
import { wait } from '../utils';
import { NODE_URL, STATE } from '../_state';


const { ACCOUNTS } = STATE;


const waves = new Waves({ NODE_URL: NODE_URL });
const provider = new TestProvider(ACCOUNTS.SIMPLE.seed);
waves.setProvider(provider);

const issue =
    waves
        .issue({
            name: 'Test',
            description: 'Test description',
            quantity: 100,
            decimals: 0,
            reissuable: false
        })
        .broadcast()
        .then(([tx]) =>
            wait(tx).then(() => tx)
        );

it('Sponsorship', async () => {
    const asset = await issue;
    const [tx] = await waves
        .sponsorship({
            assetId: asset.id,
            minSponsoredAssetFee: 1
        })
        .broadcast();

    expect(tx.fee).toBe(Math.pow(10, 8));
    await wait(tx);
});

it('Cancel Sponsorship', async () => {
    const asset = await issue;
    const [tx] = await waves
        .sponsorship({
            assetId: asset.id,
            minSponsoredAssetFee: 1
        })
        .broadcast();

    expect(tx.fee).toBe(Math.pow(10, 8));
    await wait(tx);

    const [cancel] = await waves
        .sponsorship({
            assetId: asset.id,
            minSponsoredAssetFee: 0
        })
        .broadcast();

    expect(tx.fee).toBe(Math.pow(10, 8));
    await wait(cancel);
});