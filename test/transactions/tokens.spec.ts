import { ACCOUNTS, MOCK_URL } from '../test-env';
import Signer from '../../src/Signer';
import { TestProvider } from '../TestProvider';
import { MASTER_ACCOUNT_SEED } from '@waves/node-state/dist/constants';


let waves: Signer = new Signer();
let provider: TestProvider = new TestProvider(MASTER_ACCOUNT_SEED);


beforeEach(() => {
    waves = new Signer({ NODE_URL: MOCK_URL });
    provider = new TestProvider(ACCOUNTS.SIMPLE.seed);
    waves.setProvider(provider);
});

it('Issue', async () => {
    const [tx] = await waves
        .issue({
            name: 'Test',
            description: 'Test description',
            quantity: 100,
            decimals: 0,
            reissuable: false
        })
        .broadcast();

    expect(tx.fee).toBe(Math.pow(10, 8));
});

it('Issue NFT', async () => {
    await waves
        .issue({
            name: 'NFT asset',
            description: 'NFT description',
            quantity: 1,
            decimals: 0,
            reissuable: false
        })
        .broadcast();
});

it('Reissue', async () => {
    const [tx] = await waves
        .issue({
            name: 'Test',
            description: 'Test description',
            quantity: 100,
            decimals: 0,
            reissuable: true
        })
        .broadcast();

    await waves
        .reissue({
            assetId: tx.id,
            quantity: 100,
            reissuable: true
        })
        .broadcast();
});

it('Burn', async () => {
    const [tx] = await waves
        .issue({
            name: 'Test',
            description: 'Test description',
            quantity: 100,
            decimals: 0,
            reissuable: true
        })
        .broadcast();

    await waves
        .burn({
            assetId: tx.id,
            amount: 100
        })
        .broadcast();
});
