import { ACCOUNTS, MOCK_URL } from '../test-env';
import Signer, { Provider } from '../../src/Signer';
import { TestProvider } from '../TestProvider';
import { MASTER_ACCOUNT_SEED } from '@waves/node-state/dist/constants';


let waves: Signer = new Signer();
let provider: TestProvider = new TestProvider(MASTER_ACCOUNT_SEED);


beforeEach(() => {
    waves = new Signer({ NODE_URL: MOCK_URL });
    provider = new TestProvider(ACCOUNTS.SIMPLE.seed);
    waves.setProvider(provider as unknown as Provider);
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
});
