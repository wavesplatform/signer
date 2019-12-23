import Waves from '../src/Waves';
import { TestProvider } from './TestProvider';
import { libs } from '@waves/waves-transactions';
import { CHAIN_ID, NODE_URL, STATE } from './_state';


const seed = libs.crypto.randomSeed();
const address = libs.crypto.address(seed, CHAIN_ID);
const publicKey = libs.crypto.publicKey(seed);


it('Login', async () => {
    const waves = new Waves({ NODE_URL: NODE_URL });
    const provider = new TestProvider(seed);
    await waves.setProvider(provider);

    const user = await waves.login();
    expect(user.address).toBe(address);
    expect(user.publicKey).toBe(publicKey);
});

it('Get balances empty', async () => {
    const waves = new Waves({ NODE_URL: NODE_URL });
    const provider = new TestProvider(seed);
    await waves.setProvider(provider);

    await waves.login();
    const balances = await waves.getBalance();
    expect(balances.length).toBe(1);
    expect(balances[0].assetId).toBe('WAVES');
    expect(balances[0].amount).toBe('0');
});
