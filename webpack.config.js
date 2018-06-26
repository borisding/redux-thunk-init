const path = require('path');

module.exports = function webpackConfig(env, args = {}) {
  const isDev = args.mode !== 'production';

  return {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
      path: path.resolve(__dirname, 'dist/umd'),
      filename: `redux-thunk-init${!isDev ? '.min' : ''}.js`,
      library: 'ReduxThunkInit',
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    }
  };
};
