// Libraries
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

// Files
const utils = require('./utils');
const plugins = require('../postcss.config');

const templateDataTexts = require('./texts.json');

// Configuration
module.exports = env => {
  return {
    context: path.resolve(__dirname, '../src'),
    entry: {
      app: './app.js'
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      publicPath: '/',
      filename: 'assets/js/[name].[hash:7].bundle.js'
    },
    devServer: {
      contentBase: path.resolve(__dirname, '../src')
    },
    resolve: {
      extensions: ['.js'],
      alias: {
        source: path.resolve(__dirname, '../src'), // Relative path of src
        images: path.resolve(__dirname, '../src/assets/images'), // Relative path of images
        fonts: path.resolve(__dirname, '../src/assets/fonts') // Relative path of fonts
      }
    },
    performance: {
      hints: false
    },

    /*
      Loaders with configurations
    */
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: { presets: ['es2015'] }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            env === 'development'
              ? 'style-loader'
              : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: true,
                minimize: true,
                colormin: false
              }
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            env === 'development'
              ? 'style-loader'
              : MiniCssExtractPlugin.loader, // creates style nodes from JS strings
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                minimize: true,
                sourceMap: true,
                colormin: false
              }
            }, // translates CSS into CommonJS
            'postcss-loader',
            'sass-loader' // compiles Sass to CSS
          ]
        },
        {
          test: /\.pug$/,
          use: [
            { loader: 'raw-loader' },
            {
              loader: 'pug-html-loader',
              options: {
                  pretty: true,
                  data: {
                      $texts: templateDataTexts
                  }
              }
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif|ico)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 3000,
            name: 'assets/images/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\/icons\/.*\.svg$/,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                extract: false,
                symbolId: 'icon-[name]',
                runtimeCompat: true
              }
            },
            'svgo-loader'
          ]
        },
        // {
        //   test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        //   loader: 'url-loader',
        //   options: {
        //     limit: 5000,
        //     name: 'assets/fonts/[name].[hash:7].[ext]'
        //   }
        // },
        {
          test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
          use: 'base64-inline-loader?limit=1000&name=[name].[ext]',
          exclude: /\/icons\/.*\.svg$/
        },
        {
          test: /\.(mp4)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'assets/videos/[name].[hash:7].[ext]'
          }
        }
      ]
    },

    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true
        })
      ],
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: false,
          // vendor chunk
          vendor: {
            filename: 'assets/js/vendor.[hash:7].bundle.js',
            // sync + async chunks
            chunks: 'all',
            // import file path containing node_modules
            test: /node_modules/
          }
        }
      }
    },

    plugins: [
      new CopyWebpackPlugin([
        { from: 'assets/images', to: 'assets/images' },
        //{ from: 'assets/fonts', to: 'assets/fonts' }
      ]),

      new MiniCssExtractPlugin({
        filename: 'assets/css/[name].[hash:7].bundle.css',
        chunkFilename: '[id].css'
      }),

      /* Pages */
      new HtmlWebpackPlugin({
        title: 'Dcv portfolio',
        filename: 'index.html',
        template: 'views/index.pug',
        inject: true,
        minify: false
      }),

      ...utils.pages(env),

      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.$': 'jquery',
        'window.jQuery': 'jquery'
      }),

      new SpriteLoaderPlugin({
        plainSprite: true
      }),

      new WebpackNotifierPlugin({
        title: 'Dcv portfolio'
      })
    ]
  };
};
