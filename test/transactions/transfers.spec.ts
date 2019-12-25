import Signer from '../../src/Signer';
import { TestProvider } from '../TestProvider';
import { wait } from '../utils';
import { CHAIN_ID, NODE_URL, STATE, MASTER_ACCOUNT } from '../_state';
import { libs } from '@waves/waves-transactions';

const { ACCOUNTS, ASSETS } = STATE;
const MASTER_ADDRESS = libs.crypto.address(MASTER_ACCOUNT.SEED, CHAIN_ID);
let waves: Signer = new Signer();
let provider: TestProvider = new TestProvider(MASTER_ACCOUNT.SEED);

beforeEach(() => {
    waves = new Signer({ NODE_URL: NODE_URL });
    provider = new TestProvider(ACCOUNTS.SIMPLE.seed);
    waves.setProvider(provider);
});

it('Transfer Signer', async () => {
    const [tx] = await waves
        .transfer({
            amount: 1,
            recipient: MASTER_ADDRESS,
        })
        .broadcast();

    expect(tx.fee).toBe(0.001 * Math.pow(10, 8));

    await wait(tx);
});

it('Transfer custom asset', async () => {
    const [tx] = await waves
        .transfer({
            amount: 1,
            assetId: ASSETS.BTC.id,
            recipient: MASTER_ADDRESS,
        })
        .broadcast();

    expect(tx.fee).toBe(0.001 * Math.pow(10, 8));

    await wait(tx);
});

it('Transfer two transactions', async () => {
    const [tx1, tx2] = await waves
        .transfer({
            amount: 1,
            assetId: ASSETS.BTC.id,
            recipient: MASTER_ADDRESS,
        })
        .transfer({
            amount: 2,
            assetId: ASSETS.BTC.id,
            recipient: MASTER_ADDRESS,
        })
        .broadcast();

    expect(tx1.amount).toBe(1);
    expect(tx2.amount).toBe(2);

    await Promise.all([wait(tx1), wait(tx2)]);
});

it('Transfer smart asset', async () => {
    const [tx] = await waves
        .transfer({
            amount: 1,
            assetId: ASSETS.SMART.id,
            recipient: MASTER_ADDRESS,
            fee: 0.005 * Math.pow(10, 8),
        })
        .broadcast();

    expect(tx.fee).toBe(0.005 * Math.pow(10, 8));
    await wait(tx);
});

it('Mass transfer Signer', async () => {
    const [tx] = await waves
        .massTransfer({
            transfers: [
                { recipient: MASTER_ADDRESS, amount: Math.pow(10, 8) },
                // { recipient: 'master', amount: Math.pow(10, 8) },
                { recipient: ACCOUNTS.SIMPLE.address, amount: Math.pow(10, 8) },
                // { recipient: ACCOUNTS.SIMPLE.alias, amount: Math.pow(10, 8) },
                { recipient: ACCOUNTS.SMART.address, amount: Math.pow(10, 8) },
                // { recipient: ACCOUNTS.SMART.alias, amount: Math.pow(10, 8) }
            ],
        })
        .broadcast();

    expect(tx.fee).toBe(0.003 * Math.pow(10, 8));
    await wait(tx);
});

it('Mass transfer asset', async () => {
    const [tx] = await waves
        .massTransfer({
            assetId: ASSETS.BTC.id,
            transfers: [
                { recipient: MASTER_ADDRESS, amount: Math.pow(10, 8) },
                // { recipient: 'master', amount: Math.pow(10, 8) },
                { recipient: ACCOUNTS.SIMPLE.address, amount: Math.pow(10, 8) },
                // { recipient: ACCOUNTS.SIMPLE.alias, amount: Math.pow(10, 8) },
                { recipient: ACCOUNTS.SMART.address, amount: Math.pow(10, 8) },
                // { recipient: ACCOUNTS.SMART.alias, amount: Math.pow(10, 8) }
            ],
        })
        .broadcast();

    expect(tx.fee).toBe(0.003 * Math.pow(10, 8));
    await wait(tx);
});
