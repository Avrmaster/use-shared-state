import pluginNodeResolve from '@rollup/plugin-node-resolve'
import pluginTypescript from '@rollup/plugin-typescript'
import pluginCommonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import typescript from 'typescript'
import tslib from 'tslib'

/**
 * @param config {import('rollup').RollupOptions}
 */
const bundle = (config) => ({
	external: (id) => !/^[./#]/.test(id),
	input: { main: './src/index.ts' },
	...config,
})

const commonPlugins = [
	pluginNodeResolve(),
	pluginCommonjs(),
	pluginTypescript({
		tsconfig: './tsconfig.json',
		typescript,
		tslib,
	}),
]

export default [
	// ESM JS
	bundle({
		output: {
			dir: 'dist',
			format: 'esm',
			entryFileNames: '[name].mjs',
			chunkFileNames: 'chunks/[name]-[hash].mjs',
		},
		plugins: commonPlugins,
	}),
	// CJS
	bundle({
		output: {
			dir: 'dist',
			format: 'cjs',
			entryFileNames: '[name].cjs',
			chunkFileNames: 'chunks/[name]-[hash].cjs',
		},
		plugins: commonPlugins,
	}),
	// DTS
	bundle({
		output: {
			dir: 'dist',
			entryFileNames: '[name].d.ts',
			chunkFileNames: 'chunks/[name]-[hash].d.ts',
		},
		plugins: [...commonPlugins, dts()],
	}),
].flat()
