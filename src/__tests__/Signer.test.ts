/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Signer } from '../Signer';
import * as helpers from '../helpers';
import * as validation from '../validation';
import * as clientLogs from '@waves/client-logs';
import * as getNetworkByte from '@waves/node-api-js/cjs/tools/blocks/getNetworkByte';
import * as broadcastModule from '@waves/node-api-js/cjs/tools/transactions/broadcast';
import * as waitModule from '@waves/node-api-js/cjs/tools/transactions/wait';
import * as addresses from '@waves/node-api-js/cjs/api-node/addresses';
import * as assets from '@waves/node-api-js/cjs/api-node/assets';
import { SignerOptions } from '../types';
import {
    SignerOptionsError,
    SignerEnsureProviderError,
    SignerBroadcastError,
    SignerProviderInterfaceError,
    SignerNetworkByteError,
    SignerProviderInternalError,
    SignerAuthError,
    SignerBalanceError,
    SignerMissingMatcherUrlError,
    SignerApiArgumentsError,
    SignerWaitConfirmationError,
} from '../SignerError';
import { DEFAULT_OPTIONS } from '../constants';
import { TRANSACTION_TYPE } from '@waves/ts-types';

const { fetchBalanceDetails } = addresses as jest.Mocked<typeof addresses>;
const { fetchAssetsBalance } = assets as jest.Mocked<typeof assets>;
const { makeConsole, makeOptions } = clientLogs as jest.Mocked<
    typeof clientLogs
>;
const getNetworkByteMock = getNetworkByte as jest.Mocked<typeof getNetworkByte>;
const broadcast = broadcastModule as jest.Mocked<typeof broadcastModule>;
const wait = waitModule as jest.Mocked<typeof waitModule>;

const defaultOptions = {
    NODE_URL: DEFAULT_OPTIONS.NODE_URL,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
// eslint-disable-next-line @typescript-eslint/no-empty-function
const asyncNoop = async () => {};

describe('Signer', () => {
    afterEach(() => {
        makeOptions.mockClear();
        makeConsole.mockClear();
    });

    describe('constructor()', () => {
        const validateSignerOptions = jest.spyOn(
            validation,
            'validateSignerOptions'
        );

        afterEach(() => {
            validateSignerOptions.mockClear();
        });

        afterAll(() => {
            validateSignerOptions.mockRestore();
        });

        it('instantiates logger when LOG_LEVEL option is not passed', () => {
            new Signer(defaultOptions);

            expect(makeConsole).toHaveBeenCalledTimes(1);
            expect(makeOptions).toHaveBeenCalledTimes(1);
            expect(makeOptions).toHaveBeenCalledWith('production', 'Signer');
        });

        it('instantiates logger when LOG_LEVEL option is passed', () => {
            const logLevel = 'verbose';

            new Signer({ LOG_LEVEL: logLevel, ...defaultOptions });

            expect(makeConsole).toHaveBeenCalledTimes(1);
            expect(makeOptions).toHaveBeenCalledTimes(1);
            expect(makeOptions).toHaveBeenCalledWith(logLevel, 'Signer');
        });

        it('creates error handler with instance of logger', () => {
            const errorHandlerFactoryMock = jest.spyOn(
                helpers,
                'errorHandlerFactory'
            );

            const signer = new Signer(defaultOptions);

            expect(errorHandlerFactoryMock).toHaveBeenCalledWith(
                // @ts-ignore
                signer._logger
            );

            errorHandlerFactoryMock.mockRestore();
        });

        it('validates passed signer options', () => {
            const options: SignerOptions = {
                LOG_LEVEL: 'verbose',
                ...defaultOptions,
            };

            new Signer(options);

            expect(validateSignerOptions).toHaveBeenCalledWith(options);
        });

        it('throws SignerOptionsError on invalid signer options', () => {
            const invalidProperties = [] as any;

            validateSignerOptions.mockReturnValueOnce({
                isValid: false,
                invalidProperties,
            });

            expect(() => {
                new Signer(defaultOptions);
            }).toThrow(SignerOptionsError);
        });

        it('requests networkbyte from the correct network', () => {
            new Signer(defaultOptions);
            expect(getNetworkByteMock.default).toHaveBeenCalledWith(
                defaultOptions.NODE_URL
            );
        });

        it('logs on successfull instantiation', () => {
            const signer = new Signer(defaultOptions);

            const logMessage = `Signer instance has been successfully created using options: ${JSON.stringify(
                defaultOptions
            )}`;

            // @ts-ignore
            expect(signer._logger.info).toHaveBeenCalledWith(logMessage);
            // @ts-ignore
            expect(signer._logger.info).toHaveBeenCalledTimes(1);
        });
    });

    describe('api', () => {
        const networkByte = 42;

        getNetworkByteMock.default.mockResolvedValue(networkByte);

        const validateProviderInterface = jest
            .spyOn(validation, 'validateProviderInterface')
            .mockReturnValue({
                isValid: true,
                invalidProperties: [],
            });

        beforeEach(() => validateProviderInterface.mockClear());

        afterAll(() => {
            validateProviderInterface.mockRestore();
        });

        const createProvider = () =>
            ({
                connect: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                off: jest.fn(),
                encryptMessage: jest.fn(),
                auth: jest.fn(),
                login: jest.fn(),
                logout: jest.fn(),
                signMessage: jest.fn(),
                signTypedData: jest.fn(),
                order: jest.fn(),
                decryptMessage: jest.fn(),
                sign: jest.fn(),
            } as any);

        type InitSigner = (options?: {
            withProvider?: boolean;
            withMatcherUrl?: boolean;
        }) => Promise<Signer>;

        const initSigner: InitSigner = async (
            options = { withProvider: true, withMatcherUrl: true }
        ) => {
            const signerOptions: SignerOptions = { ...defaultOptions };

            if (options.withMatcherUrl) {
                signerOptions.MATCHER_URL = DEFAULT_OPTIONS.NODE_URL;
            }

            if (!options.withProvider) {
                return new Signer(signerOptions);
            }

            const signer = new Signer(signerOptions);

            await signer.setProvider(createProvider());

            return signer;
        };

        const clearLoggerMock = (signer: Signer): void => {
            // @ts-ignore
            signer._logger.info.mockClear();
        };

        describe('on()', () => {
            const event = 'login';
            const handler = 'handler' as any;

            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                expect(() => signer.on(event, handler)).toThrow(
                    SignerEnsureProviderError
                );
            });

            it('passes arguments to provider\'s "on" method', async () => {
                const signer = await initSigner();

                signer.on(event, handler as any);

                expect(signer.provider!.on).toHaveBeenCalledWith(
                    event,
                    handler
                );
                expect(signer.provider!.on).toHaveBeenCalledTimes(1);
            });

            it('logs on success', async () => {
                const signer = await initSigner();

                clearLoggerMock(signer);

                signer.on(event, handler as any);

                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    `Handler for "${event}" event has been added.`
                );
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledTimes(1);
            });
        });

        describe('once()', () => {
            const event = 'login';
            const handler = 'handler' as any;

            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                expect(() => signer.once(event, handler)).toThrow(
                    SignerEnsureProviderError
                );
            });

            it('passes arguments to provider\'s "once" method', async () => {
                const signer = await initSigner();

                signer.once(event, handler as any);

                expect(signer.provider!.once).toHaveBeenCalledWith(
                    event,
                    handler
                );
                expect(signer.provider!.once).toHaveBeenCalledTimes(1);
            });

            it('logs on success', async () => {
                const signer = await initSigner();

                clearLoggerMock(signer);

                signer.once(event, handler as any);

                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    `One-Time handler for "${event}" event has been added.`
                );
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledTimes(1);
            });
        });

        describe('off()', () => {
            const event = 'login';
            const handler = 'handler' as any;

            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                expect(() => signer.off(event, handler)).toThrow(
                    SignerEnsureProviderError
                );
            });

            it('passes arguments to provider\'s "off" method', async () => {
                const signer = await initSigner();

                signer.off(event, handler as any);

                expect(signer.provider!.off).toHaveBeenCalledWith(
                    event,
                    handler
                );
                expect(signer.provider!.off).toHaveBeenCalledTimes(1);
            });

            it('logs on success', async () => {
                const signer = await initSigner();

                clearLoggerMock(signer);

                signer.off(event, handler as any);

                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    `Handler for "${event}" event has been removed.`
                );
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledTimes(1);
            });
        });

        describe('getMessages()', () => {
            it('returns logger messages', async () => {
                const messages = 'messages';

                const signer = await initSigner();

                // @ts-ignore
                signer._logger.getMessages.mockReturnValueOnce(messages);

                expect(signer.getMessages()).toEqual(messages);
            });

            it('passes options to logger\'s "getMessages" method', async () => {
                const options = { messageTypes: ['messageTypes'] } as any;
                const signer = await initSigner();

                signer.getMessages(options);

                // @ts-ignore
                expect(signer._logger.getMessages).toHaveBeenCalledWith(
                    options
                );
            });
        });

        describe('broadcast()', () => {
            const toBroadcast = 'toBroadcast' as any;
            const options = 'options' as any;

            it('passes arguments to node-api-js broadcast', async () => {
                const signer = await initSigner();

                signer.broadcast(toBroadcast, options).catch(noop);

                expect(broadcast.default).toHaveBeenCalledWith(
                    defaultOptions.NODE_URL,
                    toBroadcast,
                    options
                );
            });

            it('logs on success', async () => {
                const signer = await initSigner();

                clearLoggerMock(signer);

                await signer.broadcast(toBroadcast, options);

                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    'Transactions have been broadcasted.'
                );
            });

            it('returns correct value', async () => {
                const signer = await initSigner();
                const result = 'result' as any;

                broadcast.default.mockClear();
                broadcast.default.mockResolvedValueOnce(result);

                const actual = await signer.broadcast(toBroadcast, options);

                expect(actual).toBe(result);
            });

            it('throws on node-api-js broadcast error', async () => {
                const signer = await initSigner();

                broadcast.default.mockClear();
                broadcast.default.mockRejectedValueOnce(new Error());

                await expect(
                    signer.broadcast(toBroadcast, options)
                ).rejects.toThrow(SignerBroadcastError);
            });
        });

        describe('getNetworkByte()', () => {
            it('returns network byte', async () => {
                const networkByte = 1;

                getNetworkByteMock.default.mockResolvedValueOnce(networkByte);

                await expect(
                    (await initSigner()).getNetworkByte()
                ).resolves.toBe(networkByte);
            });
        });

        describe('setProvider()', () => {
            it('validates provider interface', async () => {
                const signer = await initSigner();

                expect(validateProviderInterface).toHaveBeenCalledWith(
                    signer.provider
                );
                expect(validateProviderInterface).toHaveBeenCalledTimes(1);
            });

            it('throws SignerEnsureProviderError on invalid provider', async () => {
                validateProviderInterface.mockReturnValueOnce({
                    isValid: false,
                    invalidProperties: [],
                });

                await expect(initSigner()).rejects.toThrow(
                    SignerProviderInterfaceError
                );
            });

            it('throws SignerNetworkByteError on failed network byte fetch', async () => {
                getNetworkByteMock.default.mockRejectedValueOnce(new Error());

                await expect(initSigner()).rejects.toThrow(
                    SignerNetworkByteError
                );
            });

            it('connects provider', async () => {
                expect(
                    (await initSigner()).provider!.connect
                ).toHaveBeenCalledWith({
                    NODE_URL: defaultOptions.NODE_URL,
                    NETWORK_BYTE: networkByte,
                });
            });

            it('logs all steps', async () => {
                // @ts-ignore
                expect((await initSigner())._logger.info.mock.calls)
                    .toMatchInlineSnapshot(`
                    Array [
                      Array [
                        "Signer instance has been successfully created using options: {\\"NODE_URL\\":\\"https://nodes.wavesplatform.com\\",\\"MATCHER_URL\\":\\"https://nodes.wavesplatform.com\\"}",
                      ],
                      Array [
                        "Provider has been set.",
                      ],
                      Array [
                        "Network byte has been fetched.",
                      ],
                      Array [
                        "Provider has conneced to node.",
                      ],
                    ]
                `);
            });
        });

        describe('auth()', () => {
            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                await expect(signer.auth(42)).rejects.toThrow(
                    SignerEnsureProviderError
                );
            });

            it('throws SignerProviderInternalError if provider.auth throws', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.auth.mockRejectedValueOnce(new Error());

                await expect(signer.auth(42)).rejects.toThrow(
                    SignerProviderInternalError
                );
            });

            it('passes arguments to provider.auth', async () => {
                const signer = await initSigner();

                signer.auth(42, 'hostName').catch(noop);

                expect(signer.provider!.auth).toHaveBeenCalledWith(
                    42,
                    'hostName'
                );
            });
        });

        describe('getBalances()', () => {
            it('throws SignerAuthError when not authorized', async () => {
                const signer = await initSigner();

                await expect(signer.getBalances()).rejects.toThrow(
                    SignerAuthError
                );
            });

            it('throws SignerBalanceError when not authorized', async () => {
                fetchBalanceDetails.mockRejectedValueOnce(new Error());
                fetchAssetsBalance.mockImplementationOnce(asyncNoop as any);

                const signer = await initSigner();

                // @ts-ignore
                signer._user = { address: 'address' };

                await expect(signer.getBalances()).rejects.toThrow(
                    SignerBalanceError
                );
            });

            it('returns balances and logs success', async () => {
                const address = 'address';
                const wavesBalance = 'wavesBalance' as any;
                const assetsBalances = [
                    'assetBalance1',
                    'assetBalance2',
                ] as any;

                const normalizeBalanceDetails = jest
                    .spyOn(helpers, 'normalizeBalanceDetails')
                    .mockImplementationOnce(((arg: any) => arg) as any);

                const normalizeAssetsBalanceMock = jest
                    .spyOn(helpers, 'normalizeAssetsBalance')
                    .mockImplementationOnce(((arg: any) => arg) as any);

                fetchBalanceDetails.mockResolvedValue(wavesBalance as any);

                fetchAssetsBalance.mockResolvedValueOnce(assetsBalances as any);

                const expected = [wavesBalance, ...assetsBalances];

                const signer = await initSigner();

                // @ts-ignore
                signer._user = { address };
                // @ts-ignore
                clearLoggerMock(signer);

                const actual = await signer.getBalances();

                expect(fetchBalanceDetails).toHaveBeenCalledWith(
                    defaultOptions.NODE_URL,
                    address
                );
                expect(fetchAssetsBalance).toHaveBeenCalledWith(
                    defaultOptions.NODE_URL,
                    address
                );
                expect(normalizeBalanceDetails).toHaveBeenCalledWith(
                    wavesBalance
                );
                expect(normalizeAssetsBalanceMock).toHaveBeenCalledWith(
                    address
                );
                expect(actual).toEqual(expected);
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    'User balances have been fetched.'
                );
            });
        });

        describe('login()', () => {
            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                await expect(signer.login()).rejects.toThrow(
                    SignerEnsureProviderError
                );
            });

            it('throws SignerProviderInternalError if provider.login throws', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.login.mockRejectedValueOnce(new Error());

                await expect(signer.login()).rejects.toThrow(
                    SignerProviderInternalError
                );
            });

            it('logs in and logs success', async () => {
                const user = 'user';

                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.login.mockClear();
                // @ts-ignore
                signer.provider!.login.mockReturnValueOnce(user);
                clearLoggerMock(signer);

                const result = await signer.login();

                expect(result).toBe(user);
                expect(signer.provider!.login).toHaveBeenCalledTimes(1);
                // @ts-ignore
                expect(signer._user).toBe(user);
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith('Logged in.');
            });
        });

        describe('logout()', () => {
            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                await expect(signer.logout()).rejects.toThrow(
                    SignerEnsureProviderError
                );
            });

            it('throws SignerProviderInternalError if provider.logout throws', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.logout.mockRejectedValueOnce(new Error());

                await expect(signer.logout()).rejects.toThrow(
                    SignerProviderInternalError
                );
            });

            it('logs out and logs success', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.logout.mockClear();
                clearLoggerMock(signer);

                await signer.logout();

                expect(signer.provider!.logout).toHaveBeenCalledTimes(1);
                // @ts-ignore
                expect(signer._user).toBe(undefined);
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith('Logged out.');
            });
        });
        describe('signMessage()', () => {
            const message = 'message';

            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                await expect(signer.signMessage(message)).rejects.toThrow(
                    SignerEnsureProviderError
                );
            });

            it('throws SignerProviderInternalError if provider.signMessage throws', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.signMessage.mockRejectedValueOnce(new Error());

                await expect(signer.signMessage(message)).rejects.toThrow(
                    SignerProviderInternalError
                );
            });

            it('signs message and logs success', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.signMessage.mockClear();
                // @ts-ignore
                signer.provider!.signMessage.mockReturnValueOnce(message);
                clearLoggerMock(signer);

                const result = await signer.signMessage(message);

                expect(signer.provider!.signMessage).toHaveBeenCalledTimes(1);
                expect(signer.provider!.signMessage).toHaveBeenCalledWith(
                    message
                );
                expect(result).toBe(message);
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    `Message has been signed: ${message}`
                );
            });
        });

        describe('signTypedData()', () => {
            const data = ['data'] as any;

            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                await expect(signer.signTypedData(data)).rejects.toThrow(
                    SignerEnsureProviderError
                );
            });

            it('throws SignerProviderInternalError if provider.signTypedData throws', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.signTypedData.mockRejectedValueOnce(
                    new Error()
                );

                await expect(signer.signTypedData(data)).rejects.toThrow(
                    SignerProviderInternalError
                );
            });

            it('signs message and logs success', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.signTypedData.mockClear();
                // @ts-ignore
                signer.provider!.signTypedData.mockReturnValueOnce(data);
                clearLoggerMock(signer);

                const result = await signer.signTypedData(data);

                expect(signer.provider!.signTypedData).toHaveBeenCalledTimes(1);
                expect(signer.provider!.signTypedData).toHaveBeenCalledWith(
                    data
                );
                expect(result).toBe(data);
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    `Data has been signed: ${JSON.stringify(data)}`
                );
            });
        });

        describe('getSponsoredBalances()', () => {
            it('returns only sponsored balances', async () => {
                const signer = await initSigner();

                const allBalances = [
                    { sponsorship: true, id: 'id' },
                    { sponsorship: false },
                ] as any;

                jest.spyOn(signer, 'getBalances').mockResolvedValueOnce(
                    allBalances
                );

                const actual = await signer.getSponsoredBalances();

                const expected = [{ sponsorship: true, id: 'id' }];

                expect(actual).toEqual(expected);
            });
        });

        describe('_signOrder()', () => {
            const order = 'order' as any;

            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                // @ts-ignore
                await expect(signer._signOrder(order)).rejects.toThrow(
                    SignerEnsureProviderError
                );
            });

            it('throws SignerProviderInternalError if provider._signOrder throws', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.order.mockRejectedValueOnce(new Error());

                // @ts-ignore
                await expect(signer._signOrder(order)).rejects.toThrow(
                    SignerProviderInternalError
                );
            });

            it('signs message and logs success', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.order.mockClear();
                // @ts-ignore
                signer.provider!.order.mockReturnValueOnce(order);
                clearLoggerMock(signer);

                // @ts-ignore
                const result = await signer._signOrder(order);

                expect(signer.provider!.order).toHaveBeenCalledTimes(1);
                expect(signer.provider!.order).toHaveBeenCalledWith(order);
                expect(result).toBe(order);
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    `Order has been signed: ${JSON.stringify(order)}`
                );
            });
        });

        describe('order()', () => {
            const orderArgs = 'orderArgs' as any;
            let orderRequestFactory: any;

            beforeEach(() => {
                orderRequestFactory = jest
                    .spyOn(helpers, 'orderRequestFactory')
                    .mockImplementation(
                        jest.fn(() => ({
                            createLimitOrder: jest.fn(),
                            createMarketOrder: jest.fn(),
                        }))
                    );
            });

            afterEach(() => {
                orderRequestFactory.mockClear();
            });

            afterAll(() => orderRequestFactory.mockRestore());

            it('throws SignerMissingMatcherUrlError if no matcher url provided in options', () => {
                const signer = new Signer(defaultOptions);

                // @ts-ignore
                expect(() => signer.order(orderArgs)).toThrow(
                    SignerMissingMatcherUrlError
                );
            });

            it('makes order creators', async () => {
                const signer = await initSigner();

                signer.order(orderArgs);

                expect(orderRequestFactory).toHaveBeenCalledWith(
                    // @ts-ignore
                    signer._options.MATCHER_URL,
                    signer._handleError
                );
                expect(
                    orderRequestFactory.mock.results[0].value
                ).toHaveProperty('createLimitOrder');
                expect(
                    orderRequestFactory.mock.results[0].value
                ).toHaveProperty('createMarketOrder');
            });

            it('returns correct value', async () => {
                const signer = await initSigner();

                const orderApi = signer.order(orderArgs);

                expect(orderApi).toHaveProperty('sign');
                expect(orderApi).toHaveProperty('limit');
                expect(orderApi).toHaveProperty('market');
            });

            it('orderApi tests', async () => {
                const signer = await initSigner();

                const signedOrder = 'order';
                const _signOrder = jest
                    // @ts-ignore
                    .spyOn(signer, '_signOrder')
                    .mockResolvedValue(signedOrder);

                await signer.order(orderArgs).sign();
                expect(_signOrder).toHaveBeenCalledWith(orderArgs);

                await signer.order(orderArgs).limit();
                const {
                    createLimitOrder,
                } = orderRequestFactory.mock.results[1].value;

                expect(createLimitOrder).toHaveBeenCalledWith(signedOrder);

                await signer.order(orderArgs).market();
                const {
                    createMarketOrder,
                } = orderRequestFactory.mock.results[2].value;

                expect(createMarketOrder).toHaveBeenCalledWith(signedOrder);

                _signOrder.mockRestore();
            });
        });

        describe('encryptMessage()', () => {
            const sharedKey = 'sharedKey';
            const message = 'message';
            const prefix = 'prefix';

            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                await expect(
                    signer.encryptMessage(sharedKey, message, prefix)
                ).rejects.toThrow(SignerEnsureProviderError);
            });

            it('throws SignerProviderInternalError if provider.encryptMessage throws', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.encryptMessage.mockRejectedValueOnce(
                    new Error()
                );

                await expect(
                    signer.encryptMessage(sharedKey, message, prefix)
                ).rejects.toThrow(SignerProviderInternalError);
            });

            it('encrypts message and logs success', async () => {
                const encryptedMessage = 'encryptedMessage';

                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.encryptMessage.mockClear();
                // @ts-ignore
                signer.provider!.encryptMessage.mockReturnValueOnce(
                    encryptedMessage
                );
                clearLoggerMock(signer);

                const result = await signer.encryptMessage(
                    sharedKey,
                    message,
                    prefix
                );

                expect(signer.provider!.encryptMessage).toHaveBeenCalledTimes(
                    1
                );
                expect(signer.provider!.encryptMessage).toHaveBeenCalledWith(
                    sharedKey,
                    message,
                    prefix
                );
                expect(result).toBe(encryptedMessage);
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    `Message has been encrypted: ${JSON.stringify(
                        encryptedMessage
                    )}`
                );
            });
        });

        describe('decryptMessage()', () => {
            const sharedKey = 'sharedKey';
            const message = 'message';
            const prefix = 'prefix';

            it('throws SignerEnsureProviderError if provider is not set', async () => {
                const signer = await initSigner({ withProvider: false });

                await expect(
                    signer.decryptMessage(sharedKey, message, prefix)
                ).rejects.toThrow(SignerEnsureProviderError);
            });

            it('throws SignerProviderInternalError if provider.decryptMessage throws', async () => {
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.decryptMessage.mockRejectedValueOnce(
                    new Error()
                );

                await expect(
                    signer.decryptMessage(sharedKey, message, prefix)
                ).rejects.toThrow(SignerProviderInternalError);
            });

            it('decrypts message and logs success', async () => {
                const decryptedMessage = 'decryptedMessage';
                const signer = await initSigner();

                // @ts-ignore
                signer.provider!.decryptMessage.mockClear();
                // @ts-ignore
                signer.provider!.decryptMessage.mockReturnValueOnce(
                    decryptedMessage
                );
                clearLoggerMock(signer);

                const result = await signer.decryptMessage(
                    sharedKey,
                    message,
                    prefix
                );

                expect(signer.provider!.decryptMessage).toHaveBeenCalledTimes(
                    1
                );
                expect(signer.provider!.decryptMessage).toHaveBeenCalledWith(
                    sharedKey,
                    message,
                    prefix
                );
                expect(result).toBe(decryptedMessage);
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    `Message has been decrypted: ${JSON.stringify(
                        decryptedMessage
                    )}`
                );
            });
        });

        describe('_sign()', () => {
            const toSign = 'toSign' as any;

            const validateTxs = jest
                .spyOn(validation, 'validateTxs')
                .mockImplementation(
                    jest.fn(() => ({ isValid: true, errors: [] }))
                );

            afterEach(() => {
                validateTxs.mockClear();
            });

            afterAll(() => {
                validateTxs.mockRestore();
            });

            it('validates transactions', async () => {
                const signer = await initSigner();

                // @ts-ignore
                await signer._sign(toSign);

                expect(validateTxs).toHaveBeenCalledWith(toSign);
            });

            it('throws SignerApiArgumentsError if there are invalid transactions', async () => {
                validateTxs.mockReturnValueOnce({ isValid: false, errors: [] });

                const signer = await initSigner();

                // @ts-ignore
                await expect(signer._sign(toSign)).rejects.toThrow(
                    SignerApiArgumentsError
                );
            });

            it('signs transactions and logs success', async () => {
                const signedTxs = 'signedTxs' as any;
                const signer = await initSigner();

                clearLoggerMock(signer);
                // @ts-ignore
                signer.provider!.sign.mockResolvedValueOnce(signedTxs);

                // @ts-ignore
                const result = await signer._sign(toSign);

                expect(result).toBe(signedTxs);
                // @ts-ignore
                expect(signer._logger.info).toHaveBeenCalledWith(
                    'Transactions have been signed.'
                );
            });
        });

        describe('_createPipelineAPI()', () => {
            const createApiTxMethodsSpies = (signer: Signer) => ({
                //@ts-ignore
                _issueSpy: jest.spyOn(signer, '_issue'),
                //@ts-ignore
                _transferSpy: jest.spyOn(signer, '_transfer'),
                //@ts-ignore
                _reissueSpy: jest.spyOn(signer, '_reissue'),
                //@ts-ignore
                _burnSpy: jest.spyOn(signer, '_burn'),
                //@ts-ignore
                _leaseSpy: jest.spyOn(signer, '_lease'),
                //@ts-ignore
                _exchangeSpy: jest.spyOn(signer, '_exchange'),
                //@ts-ignore
                _cancelLeaseSpy: jest.spyOn(signer, '_cancelLease'),
                //@ts-ignore
                _aliasSpy: jest.spyOn(signer, '_alias'),
                //@ts-ignore
                _massTransferSpy: jest.spyOn(signer, '_massTransfer'),
                //@ts-ignore
                _dataSpy: jest.spyOn(signer, '_data'),
                //@ts-ignore
                _sponsorshipSpy: jest.spyOn(signer, '_sponsorship'),
                //@ts-ignore
                _setScriptSpy: jest.spyOn(signer, '_setScript'),
                //@ts-ignore
                _setAssetScriptSpy: jest.spyOn(signer, '_setAssetScript'),
                //@ts-ignore
                _invokeSpy: jest.spyOn(signer, '_invoke'),
            });

            it('returns api with required methods', async () => {
                const signer = await initSigner();
                const prevCallTxList = ['tx1'] as any;
                const signerTx = 'tx2';

                const expected = {
                    issue: expect.any(Function),
                    transfer: expect.any(Function),
                    reissue: expect.any(Function),
                    burn: expect.any(Function),
                    lease: expect.any(Function),
                    exchange: expect.any(Function),
                    cancelLease: expect.any(Function),
                    alias: expect.any(Function),
                    massTransfer: expect.any(Function),
                    data: expect.any(Function),
                    sponsorship: expect.any(Function),
                    setScript: expect.any(Function),
                    setAssetScript: expect.any(Function),
                    invoke: expect.any(Function),
                    sign: expect.any(Function),
                    broadcast: expect.any(Function),
                };

                expect(
                    // @ts-ignore
                    signer._createPipelineAPI(prevCallTxList, signerTx)
                ).toMatchObject(expected);
            });

            it('adds transactions from the previous api call to the next api call', async () => {
                const signer = await initSigner();
                const prevCallTxList = ['tx1'] as any;
                const signerTx = 'tx2';

                const {
                    _issueSpy,
                    _transferSpy,
                    _reissueSpy,
                    _burnSpy,
                    _leaseSpy,
                    _exchangeSpy,
                    _cancelLeaseSpy,
                    _aliasSpy,
                    _massTransferSpy,
                    _dataSpy,
                    _sponsorshipSpy,
                    _setScriptSpy,
                    _setAssetScriptSpy,
                    _invokeSpy,
                } = createApiTxMethodsSpies(signer);

                // @ts-ignore
                signer._createPipelineAPI(prevCallTxList, signerTx);

                expect(_issueSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_transferSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_reissueSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_burnSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_leaseSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_exchangeSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_cancelLeaseSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_aliasSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_massTransferSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_dataSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_sponsorshipSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_setScriptSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_setAssetScriptSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
                expect(_invokeSpy).toHaveBeenCalledWith(['tx1', 'tx2']);
            });

            it('passes single transaction as array to the next api call', async () => {
                const signer = await initSigner();
                const emptyPrevCallTxList = [] as any;
                const signerTx = 'tx1';

                const {
                    _issueSpy,
                    _transferSpy,
                    _reissueSpy,
                    _burnSpy,
                    _leaseSpy,
                    _exchangeSpy,
                    _cancelLeaseSpy,
                    _aliasSpy,
                    _massTransferSpy,
                    _dataSpy,
                    _sponsorshipSpy,
                    _setScriptSpy,
                    _setAssetScriptSpy,
                    _invokeSpy,
                } = createApiTxMethodsSpies(signer);

                // @ts-ignore
                signer._createPipelineAPI(emptyPrevCallTxList, signerTx);

                expect(_issueSpy).toHaveBeenCalledWith(['tx1']);
                expect(_transferSpy).toHaveBeenCalledWith(['tx1']);
                expect(_reissueSpy).toHaveBeenCalledWith(['tx1']);
                expect(_burnSpy).toHaveBeenCalledWith(['tx1']);
                expect(_leaseSpy).toHaveBeenCalledWith(['tx1']);
                expect(_exchangeSpy).toHaveBeenCalledWith(['tx1']);
                expect(_cancelLeaseSpy).toHaveBeenCalledWith(['tx1']);
                expect(_aliasSpy).toHaveBeenCalledWith(['tx1']);
                expect(_massTransferSpy).toHaveBeenCalledWith(['tx1']);
                expect(_dataSpy).toHaveBeenCalledWith(['tx1']);
                expect(_sponsorshipSpy).toHaveBeenCalledWith(['tx1']);
                expect(_setScriptSpy).toHaveBeenCalledWith(['tx1']);
                expect(_setAssetScriptSpy).toHaveBeenCalledWith(['tx1']);
                expect(_invokeSpy).toHaveBeenCalledWith(['tx1']);
            });

            it('broadcast single transaction', async () => {
                const options = 'options' as any;
                const emptyPrevCallTxList = [] as any;
                const signerTx = 'tx1' as any;
                const signedTxs = signerTx as any;
                const broadcastedTxs = signerTx as any;

                const signer = await initSigner();

                const _signSpy = jest
                    // @ts-ignore
                    .spyOn(signer, '_sign')
                    .mockResolvedValueOnce(signedTxs);
                const broadcastSpy = jest
                    .spyOn(signer, 'broadcast')
                    .mockResolvedValueOnce(broadcastedTxs);

                // @ts-ignore
                const api = signer._createPipelineAPI(
                    emptyPrevCallTxList,
                    signerTx
                );
                const result = await api.broadcast(options);

                expect(_signSpy).toHaveBeenCalledWith(signerTx);
                expect(broadcastSpy).toHaveBeenCalledWith(signedTxs, options);
                expect(result).toEqual(broadcastedTxs);

                _signSpy.mockRestore();
                broadcastSpy.mockRestore();
            });

            it('broadcast multiple transaction', async () => {
                const options = 'options';
                const prevCallTxList = ['tx1'] as any;
                const signerTx = 'tx2';
                const joinedTxs = [...prevCallTxList, signerTx];
                const signedTxs = joinedTxs;
                const broadcastedTxs = joinedTxs as any;

                const signer = await initSigner();

                const _signSpy = jest
                    // @ts-ignore
                    .spyOn(signer, '_sign')
                    .mockResolvedValueOnce(signedTxs);
                const broadcastSpy = jest
                    .spyOn(signer, 'broadcast')
                    .mockResolvedValueOnce(broadcastedTxs);

                // @ts-ignore
                const api = signer._createPipelineAPI(prevCallTxList, signerTx);
                const result = await api.broadcast(options);

                expect(_signSpy).toHaveBeenCalledWith(joinedTxs);
                expect(broadcastSpy).toHaveBeenCalledWith(signedTxs, options);
                expect(result).toEqual(broadcastedTxs);

                _signSpy.mockRestore();
                broadcastSpy.mockRestore();
            });
        });

        describe('waitTxConfirm()', () => {
            const tx = 'tx' as any;
            const confirmations = 'confirmations' as any;

            it('waits tx confirmations', async () => {
                const expected = 'result' as any;

                wait.default.mockResolvedValueOnce(expected);

                const signer = await initSigner();

                const actual = await signer.waitTxConfirm(tx, confirmations);

                expect(wait.default).toHaveBeenCalledWith(
                    DEFAULT_OPTIONS.NODE_URL,
                    tx,
                    {
                        confirmations,
                    }
                );
                expect(actual).toBe(expected);
                // exp
            });

            it('throws SignerWaitConfirmationError if node-api-js throws', async () => {
                wait.default.mockRejectedValueOnce(new Error());

                const signer = await initSigner();

                await expect(
                    signer.waitTxConfirm(tx, confirmations)
                ).rejects.toThrow(SignerWaitConfirmationError);
            });
        });

        describe('batch()', () => {
            const signedTransactions = 'signedTransactions' as any;
            const broadcastResult = 'broadcast' as any;

            let signer: Signer;
            let _signSpy: any;
            let broadcastSpy: any;

            const validateTxs = jest
                .spyOn(validation, 'validateTxs')
                .mockReturnValueOnce({ isValid: true, errors: [] });

            beforeAll(async () => {
                signer = await initSigner();
                _signSpy = jest
                    // @ts-ignore
                    .spyOn(signer, '_sign')
                    .mockResolvedValue(signedTransactions);
                broadcastSpy = jest
                    .spyOn(signer, 'broadcast')
                    .mockResolvedValue(broadcastResult);
            });

            afterEach(() => {
                _signSpy.mockClear();
                broadcastSpy.mockClear();
            });

            afterAll(() => {
                _signSpy.mockRestore();
                broadcastSpy.mockRestore();
                validateTxs.mockRestore();
            });

            it('returned object has required methods', () => {
                const expected = {
                    sign: expect.any(Function),
                    broadcast: expect.any(Function),
                };

                expect(signer.batch([])).toMatchObject(expected);
            });

            it('returned "sign" method calls signer._sign and returns it\'s result', async () => {
                const txs = 'txs' as any;
                const { sign } = signer.batch(txs);
                const result = await sign();

                expect(_signSpy).toHaveBeenCalledWith(txs);
                expect(result).toBe(signedTransactions);
            });

            it('returned "broadcast" method signs txs, calls signer.broadcast and returns it\'s result', async () => {
                const txs = 'txs' as any;
                const options = 'options' as any;
                const { broadcast } = signer.batch(txs);
                const result = await broadcast(options);

                expect(_signSpy).toHaveBeenCalledWith(txs);
                expect(broadcastSpy).toHaveBeenCalledWith(
                    signedTransactions,
                    options
                );
                expect(result).toBe(broadcastResult);
            });
        });

        describe('tx methods', () => {
            const expected = 'result';
            const args = { test: 'test' } as any;
            let signer: Signer;
            let _createPipelineAPI: any;

            beforeAll(async () => {
                signer = await initSigner();
                _createPipelineAPI = jest
                    // @ts-ignore
                    .spyOn(signer, '_createPipelineAPI')
                    .mockReturnValue(expected);
            });

            afterEach(() => _createPipelineAPI.mockClear());
            afterAll(() => _createPipelineAPI.mockRestore());

            describe('issue()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.issue(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.ISSUE,
                    });
                });
            });

            describe('transfer()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.transfer(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.TRANSFER,
                    });
                });
            });

            describe('reissue()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.reissue(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.REISSUE,
                    });
                });
            });

            describe('burn()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.burn(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.BURN,
                    });
                });
            });

            describe('lease()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.lease(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.LEASE,
                    });
                });
            });

            describe('exchange()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.exchange(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.EXCHANGE,
                    });
                });
            });

            describe('cancelLease()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.cancelLease(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.CANCEL_LEASE,
                    });
                });
            });
            describe('alias()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.alias(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.ALIAS,
                    });
                });
            });

            describe('massTransfer()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.massTransfer(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.MASS_TRANSFER,
                    });
                });
            });

            describe('data()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.data(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.DATA,
                    });
                });
            });

            describe('sponsorship()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.sponsorship(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.SPONSORSHIP,
                    });
                });
            });

            describe('setScript()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.setScript(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.SET_SCRIPT,
                    });
                });
            });

            describe('setAssetScript()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.setAssetScript(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.SET_ASSET_SCRIPT,
                    });
                });
            });

            describe('invoke()', () => {
                it('passes arguments to Signer._createPipelineAPI', () => {
                    const actual = signer.invoke(args);

                    expect(actual).toBe(expected);
                    expect(_createPipelineAPI).toHaveBeenCalledWith([], {
                        ...args,
                        type: TRANSACTION_TYPE.INVOKE_SCRIPT,
                    });
                });
            });
        });
    });
});
