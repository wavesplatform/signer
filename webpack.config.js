const path = require('path');

const main = (name, minimize) => ({
    entry: './src/Waves.ts',
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
        library: 'wavesJs',
        libraryTarget: "umd",
        globalObject: "this",
        filename: name,
        path: path.resolve(__dirname, 'dist'),
    }
});

module.exports = [
    {
        ...main('waves-js.js', false),
        devtool: 'inline-source-map',
        mode: "development",
    },
    {
        ...main('waves-js.min.js', true)
    }
];