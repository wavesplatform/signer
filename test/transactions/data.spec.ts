import Waves from '../../src/Waves';
import { TestProvider } from '../TestProvider';
import { wait } from '../utils';
import { NODE_URL, STATE } from '../_state';
import { MASTER_ACCOUNT_SEED } from '@waves/node-state/dist/constants';


const { ACCOUNTS } = STATE;
let waves: Waves = new Waves();
let provider: TestProvider = new TestProvider(MASTER_ACCOUNT_SEED);


beforeEach(() => {
    waves = new Waves({ NODE_URL: NODE_URL });
    provider = new TestProvider(ACCOUNTS.SIMPLE.seed);
    waves.setProvider(provider);
});

it('Data', async () => {
    const [tx] = await waves
        .data({
            data: [
                { key: 'string', type: 'string', value: 'string' },
                { key: 'number', type: 'integer', value: 100 },
                { key: 'boolean', type: 'boolean', value: true }
            ]
        })
        .broadcast();

    expect(tx.fee).toBe(0.001 * Math.pow(10, 8));

    await wait(tx);
});
