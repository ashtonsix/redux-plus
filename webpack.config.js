const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const env = process.env.NODE_ENV

const config = {
  entry: {
    index: './src/index',
    creators: './src/creators',
    enhancers: './src/enhancers',
    helpers: './src/helpers',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/modules', // eslint-disable-line prefer-template
    library: 'redux-plus',
    libraryTarget: 'umd',
  },
  target: 'node',
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  ],
  module: {
    loaders: [
      {test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/},
    ],
  },
}

if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    }),
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true,
    })
  )
}

module.exports = config
