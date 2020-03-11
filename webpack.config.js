const path = require('path');
const merge = require('webpack-merge'); // делает deep merge конфигов
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { EnvironmentPlugin } = require('webpack');

const NODE_ENV = process.env.NODE_ENV

const PATHS = {
    root: path.resolve(__dirname),
    dist: path.resolve('./dist')
}

const commonConfig = (mode) => merge([{
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
        }),
        new EnvironmentPlugin(['NODE_ENV'])
    ],
    mode
}]);

const plugins = ({ ba }) => ({
    plugins: [
        ba && new BundleAnalyzerPlugin()
    ].filter(Boolean)
})

const entry = (name) => ({
    entry: { [name]: path.join(PATHS.root, 'src', 'index.ts') }
})

module.exports = (env = {}) => {
    const mode = NODE_ENV

    const pluginsConfig = {
        ba: env.ba // pass --env.ba to enable bundle analyzer
    }

    if (mode === 'production') {
        return merge([
            commonConfig(mode),
            entry('signer.min'),
            plugins(pluginsConfig),
        ]);
    } else if (mode === 'development') {
        return merge([
            commonConfig(mode),
            entry('signer'),
            plugins(pluginsConfig),
            { devtool: 'inline-source-map' },
        ]);
    } else {
        throw new Error(`Unexpected mode provided: ${mode}. Must be one of ['development', 'production']`);
    }
};
