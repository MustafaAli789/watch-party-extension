const path = require( 'path' );

module.exports = {

    // bundling mode
    mode: 'development',

    // entry files
    entry: {
        'background': './background.ts',
        'foreground': './foreground.ts',
        'popup': './popup.ts'
    },

    // output bundles (location)
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: '[name].js',
    },

    // file resolutions
    resolve: {
        extensions: [ '.ts', '.js' ],
    },
    devtool: 'inline-source-map',
    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    }
};