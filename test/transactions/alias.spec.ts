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

it('Alias', async () => {
    const [tx] = await waves
        .alias({
            alias: `test@${Date.now()}`
        })
        .broadcast();

    expect(tx.fee).toBe(0.001 * Math.pow(10, 8));

    await wait(tx);
});