const path = require('path');

const main = (name, minimize) => ({
    entry: './src/Signer.ts',
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        minimize,
        usedExports: true
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        library: 'signer',
        libraryTarget: "umd",
        globalObject: "this",
        filename: name,
        path: path.resolve(__dirname, 'dist'),
    }
});

module.exports = [
    {
        ...main('signer.js', false),
        devtool: 'inline-source-map',
        mode: "development",
    },
    {
        ...main('signer.min.js', true)
    }
];