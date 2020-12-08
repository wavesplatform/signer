import { ACCOUNTS, MOCK_URL, NETWORK_BYTE } from '../test-env';
import Signer from '../../src/Signer';
import { TestProvider } from '../TestProvider';
import { libs } from '@waves/waves-transactions';


const MASTER_ADDRESS = libs.crypto.address(ACCOUNTS.SIMPLE.seed, NETWORK_BYTE);
let waves: Signer = new Signer();
let provider: TestProvider = new TestProvider(ACCOUNTS.SIMPLE.seed);

beforeEach(() => {
    waves = new Signer({ NODE_URL: MOCK_URL });
    provider = new TestProvider(ACCOUNTS.SIMPLE.seed);
    waves.setProvider(provider);
});

it('Transfer Signer', async () => {
    await waves
        .transfer({
            amount: 1,
            recipient: MASTER_ADDRESS,
        })
        .broadcast();
});

it('Transfer custom asset', async () => {
    const [{ id }] = await waves.issue({
        name: 'Bitcoin',
        decimals: 8,
        quantity: 10000,
    }).broadcast();

    await waves
        .transfer({
            amount: 1,
            assetId: id,
            recipient: MASTER_ADDRESS,
        })
        .broadcast();
});

it('Transfer two transactions', async () => {
    const [{ id }] = await waves.issue({
        name: 'Bitcoin',
        decimals: 8,
        quantity: 10000,
    }).broadcast();

    await waves
        .transfer({
            amount: 1,
            assetId: id,
            recipient: MASTER_ADDRESS,
        })
        .transfer({
            amount: 2,
            assetId: id,
            recipient: MASTER_ADDRESS,
        })
        .broadcast();
});

it('Transfer smart asset', async () => {
    const [{ id }] = await waves.issue({
        name: 'Bitcoin',
        decimals: 8,
        quantity: 10000,
    }).broadcast();

    const [tx] = await waves
        .transfer({
            amount: 1,
            assetId: id,
            recipient: MASTER_ADDRESS,
            fee: 0.005 * Math.pow(10, 8),
        })
        .broadcast();

    expect(tx.fee).toBe(0.005 * Math.pow(10, 8));
});

it('Mass transfer Signer', async () => {
    await waves
        .massTransfer({
            transfers: [
                { recipient: MASTER_ADDRESS, amount: Math.pow(10, 8) }
            ],
        })
        .broadcast();
});

it('Mass transfer asset', async () => {
    const [{ id }] = await waves.issue({
        name: 'Bitcoin',
        decimals: 8,
        quantity: 10000,
    }).broadcast();

    await waves
        .massTransfer({
            assetId: id,
            transfers: [
                { recipient: MASTER_ADDRESS, amount: Math.pow(10, 8) },
            ],
        })
        .broadcast();
});
