const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const isDev = process.argv.some(v => v.includes('webpack-dev-server'));

module.exports =
{
	// This is the "main" file which should include all other modules
	entry: './src/main.js',
	// Where should the compiled file go?
	output:
	{
		publicPath: '/',
		filename: '[name].[contenthash].js'
	},
	mode: isDev ? 'development' : 'production',
	devtool: isDev ? '': 'eval',
	resolve: {
		alias: {
			vue: isDev ? 'vue/dist/vue' : 'vue/dist/vue.min',
			ethers: isDev ? 'ethers/dist/ethers' : 'ethers/dist/ethers.min',
		},
	},
	module:
	{
		rules:
		[
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use:
				{
					loader: 'babel-loader',
					options:
					{
						presets: ['@babel/preset-env'],
					}
				},
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				use: [
				{
					loader: 'file-loader',
					options:
					{
						name: '[path][name].[ext]',
					},
				}],
			},
			{
				test: /\.ico$/,
				use: [
				{
					loader: 'file-loader',
					options:
					{
						name: '[name].[ext]',
					},
				}],
			},
		]
	},
	plugins:
	[
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin(
		{
			template: 'public/index.html',
		}),
		new VueLoaderPlugin(),
	],
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
			},
		},
	},
	devServer: {
		historyApiFallback: true
	}
};
