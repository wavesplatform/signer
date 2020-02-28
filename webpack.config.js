const path = require('path');
const merge = require('webpack-merge'); // делает deep merge конфигов
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV

const PATHS = {
    root: path.resolve(__dirname),
    dist: path.resolve('./dist')
}

const commonConfig = merge([{
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: [
                    /node_modules/,
                    path.join(PATHS.root, 'test')
                ],
                options: {
                    transpileOnly: true
                }
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        modules: ['node_modules'],
    },
    output: {
        library: 'signer',
        libraryTarget: 'umd',
        globalObject: 'this',
        path: PATHS.dist,
        filename: '[name].js'
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            tsconfig: path.join(PATHS.root, 'tsconfig.build.json')
        })
    ]
}]);

module.exports = () => {
    const mode = NODE_ENV

    if (mode === 'production') {
        return merge([
            commonConfig,
            { entry:
                {
                    'signer.min': path.join(PATHS.root, 'src', 'index.ts')
                },
            },
            { mode }
        ]);
    } else if (mode === 'development') {
        return merge([
            commonConfig,
            { entry:
                {
                    'signer': path.join(PATHS.root, 'src', 'index.ts')
                },
            },
            { devtool: 'inline-source-map' },
            { mode },
        ]);
    } else {
        throw new Error(`Unexpected mode provided: ${mode}. Must be one of ['development', 'production']`);
    }
};
