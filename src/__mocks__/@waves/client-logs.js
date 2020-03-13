module.exports = {
    makeOptions: jest.fn((options) => options),
    makeConsole: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
        log: jest.fn(),
        getMessages: jest.fn(),
    })),
};
