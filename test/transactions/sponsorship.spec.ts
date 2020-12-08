import { ACCOUNTS, MOCK_URL } from '../test-env';
import Signer from '../../src/Signer';
import { TestProvider } from '../TestProvider';


const waves = new Signer({ NODE_URL: MOCK_URL });
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

it('Sponsorship', async () => {
    const [asset] = await issue;
    await waves
        .sponsorship({
            assetId: asset.id,
            minSponsoredAssetFee: 1
        })
        .broadcast();
});

it('Cancel Sponsorship', async () => {
    const [asset] = await issue;
    await waves
        .sponsorship({
            assetId: asset.id,
            minSponsoredAssetFee: 1
        })
        .broadcast();

    await waves
        .sponsorship({
            assetId: asset.id,
            minSponsoredAssetFee: 0
        })
        .broadcast();
});
