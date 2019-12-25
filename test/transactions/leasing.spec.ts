import Signer from '../../src/Signer';
import { TestProvider } from '../TestProvider';
import { wait } from '../utils';
import { libs } from '@waves/waves-transactions';
import { CHAIN_ID, NODE_URL, STATE } from '../_state';
import { MASTER_ACCOUNT_SEED } from '@waves/node-state/dist/constants';


const { ACCOUNTS } = STATE;
const MASTER_ADDRESS = libs.crypto.address(MASTER_ACCOUNT_SEED, CHAIN_ID);
let waves: Signer = new Signer();
let provider: TestProvider = new TestProvider(MASTER_ACCOUNT_SEED);


beforeEach(() => {
    waves = new Signer({ NODE_URL: NODE_URL });
    provider = new TestProvider(ACCOUNTS.SIMPLE.seed);
    waves.setProvider(provider);
});

it('Lease', async () => {
    const [tx] = await waves
        .lease({
            recipient: MASTER_ADDRESS,
            amount: 100
        })
        .broadcast();

    expect(tx.fee).toBe(0.001 * Math.pow(10, 8));

    await wait(tx);
});

it('Cancel lease', async () => {
    const [tx] = await waves
        .lease({
            recipient: MASTER_ADDRESS,
            amount: 100
        })
        .broadcast();

    expect(tx.fee).toBe(0.001 * Math.pow(10, 8));

    await wait(tx);

    const [cancel] = await waves
        .cancelLease({ leaseId: tx.id })
        .broadcast();

    await wait(cancel);
});