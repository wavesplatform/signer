describe('fetch compatibility', () => {
    const nativeFetch = (global as any).fetch;

    afterAll(() => {
        (global as any).fetch = nativeFetch;
    });

    it('provides fetch for Node.js runtimes without a native implementation', () => {
        delete (global as any).fetch;

        require('../src/fetch');

        expect(typeof (global as any).fetch).toBe('function');
    });
});
