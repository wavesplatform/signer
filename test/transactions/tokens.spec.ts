import Signer from '../../src/Signer';
import { TestProvider } from '../TestProvider';
import { wait } from '../utils';
import { NODE_URL, STATE } from '../_state';
import { MASTER_ACCOUNT_SEED } from '@waves/node-state/dist/constants';


const { ACCOUNTS } = STATE;

let waves: Signer = new Signer();
let provider: TestProvider = new TestProvider(MASTER_ACCOUNT_SEED);


beforeEach(() => {
    waves = new Signer({ NODE_URL: NODE_URL });
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

    await wait(tx);
});

it('Issue NFT', async () => {
    const [tx] = await waves
        .issue({
            name: 'NFT asset',
            description: 'NFT description',
            quantity: 1,
            decimals: 0,
            reissuable: false
        })
        .broadcast();

    // TODO Fix current fee in @waves/waves-transactions
    // expect(tx.fee).toBe(0.001 * Math.pow(10, 8));

    await wait(tx);
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

    await wait(tx);

    const [reissue] = await waves
        .reissue({
            assetId: tx.id,
            quantity: 100,
            reissuable: true
        })
        .broadcast();

    await wait(reissue);
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

    await wait(tx);

    const [reissue] = await waves
        .burn({
            assetId: tx.id,
            quantity: 100
        })
        .broadcast();

    await wait(reissue);
});