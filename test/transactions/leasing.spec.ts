import { ACCOUNTS, MOCK_URL, NETWORK_BYTE } from '../test-env';
import Signer from '../../src/Signer';
import { TestProvider } from '../TestProvider';
import { libs } from '@waves/waves-transactions';


const MASTER_ADDRESS = libs.crypto.address(ACCOUNTS.NODE.seed, NETWORK_BYTE);
let waves: Signer = new Signer();
let provider: TestProvider = new TestProvider(ACCOUNTS.SIMPLE.seed);


beforeEach(() => {
    waves = new Signer({ NODE_URL: MOCK_URL });
    provider = new TestProvider(ACCOUNTS.SIMPLE.seed);
    waves.setProvider(provider as unknown as any);
});

it('Lease', async () => {
    const [tx] = await waves
        .lease({
            recipient: MASTER_ADDRESS,
            amount: 100,
        })
        .broadcast();

    expect(tx.fee).toBe(0.001 * Math.pow(10, 8));
});

it('Cancel lease', async () => {
    const [tx] = await waves
        .lease({
            recipient: MASTER_ADDRESS,
            amount: 100,
        })
        .broadcast();

    expect(tx.fee).toBe(0.001 * Math.pow(10, 8));

    const [cancel] = await waves
        .cancelLease({ leaseId: tx.id })
        .broadcast();

    expect(cancel.fee).toBe(0.001 * Math.pow(10, 8));
});
