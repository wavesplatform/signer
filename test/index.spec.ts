import { NETWORK_BYTE, NODE_URL } from './test-env';
import Signer from '../src/Signer';
import { TestProvider } from './TestProvider';
import { libs } from '@waves/waves-transactions';

const seed = libs.crypto.randomSeed();
const address = libs.crypto.address(seed, NETWORK_BYTE);
const publicKey = libs.crypto.publicKey(seed);


it('Login', async () => {
    const waves = new Signer({ NODE_URL });
    const provider = new TestProvider(seed);
    await waves.setProvider(provider as any);

    const user = await waves.login();
    expect(user.address).toBe(address);
    expect(user.publicKey).toBe(publicKey);
});

it('Get balances empty', async () => {
    const waves = new Signer({ NODE_URL });
    const provider = new TestProvider(seed);
    await waves.setProvider(provider as any);

    await waves.login();
    const balances = await waves.getBalance();
    expect(balances.length).toBe(1);
    expect(balances[0].assetId).toBe('WAVES');
    expect(balances[0].amount).toBe('0');
});
