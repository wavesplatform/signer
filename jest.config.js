module.exports = {
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.test.json',
        },
    },
    collectCoverageFrom: ['**/src/**/*.tsx', '**/src/**/*.ts'],
};
