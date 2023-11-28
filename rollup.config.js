import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import bundleAnalyzer from 'rollup-plugin-bundle-analyzer';
import tscAlias from 'rollup-plugin-tsc-alias';
import path from 'path';

const args = process.argv.slice(2);
const getArgvParameter = (argv, key) => {
  const value = argv.find((item) => item.includes(key))?.split('=')[1] || '';
  return value.trim().replace(/"/g, '').replace(/'/g, '');
};

const plugins = [];
const analyze = getArgvParameter(args, '--analyze');
if (analyze) plugins.push(bundleAnalyzer());
plugins.push(terser({output: {comments: false}}));
const tsOptions = {
  tsconfig: './tsconfig.json',
  include: ['src/**/**/*.ts'],
  exclude: ['src/**/**/*.test.ts', '__mocks__'],
};

function getDir(output) {
  const dir = output?.dir || output?.[0]?.dir;
  return dir ? dir : path.dirname(output?.file || output?.[0].file);
}
// https://rollupjs.org/configuration-options/#output-paths
// https://rollupjs.org/plugin-development/#outputoptions
// TODO: протестить 3 варианта output:
// просто 1
// массив в одной папке index.js and index.modern.js
// массив ./dist/cjs/sub/index.js ./dist/es/sub/index.js
function externalAlias(entries) {
  let dir;
  return {
    name: 'external-alias',
    options: (opts) => {
      dir = getDir(opts.output);
      return opts;
    },
    async resolveId(source, importer, options) {
      // нельзя делать мульти оупут
      if (entries.length === 0) return null;

      const resolver = entries?.[source];
      if (!resolver) return null;

      const { output, absolute } = resolver;
      return await this.resolve(source, importer, {
        skipSelf: true,
        ...options
      }).then((resolved) => resolved ? ({
        ...resolved,
        external: true,
        id: output ? output : path.relative(dir, absolute)
      }) : null);
    }
  };
}

export default [
  {
    input: 'src/index.ts',
    output: {
      exports: 'named',
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: false,
    },
    external: ['react'],
    plugins: [
      typescript({
        ...tsOptions,
        compilerOptions: {
          declaration: false,
        }
      }),
      tscAlias(),
      ...plugins,
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      exports: 'named',
      file: 'dist/index.modern.js',
      format: 'es',
      sourcemap: false,
    },
    external: ['react'],
    plugins: [
      externalAlias({
        '@core': { output: './core/index.modern.js' },
        '@hooks': { output: './hooks/index.modern.js' },
        '@utils': { output: './utils/index.modern.js' },
      }),
      commonjs(),
      typescript(tsOptions),
      tscAlias(),
      ...plugins,
    ],
  },
  {
    input: 'src/core/index.ts',
    output: {
      exports: 'named',
      file: 'dist/core/index.modern.js',
      format: 'es',
      sourcemap: false,
    },
    external: ['react'],
    plugins: [
      externalAlias({
        '@utils': { output: '../utils/index.modern.js' },
      }),
      commonjs(),
      typescript({
        ...tsOptions,
        compilerOptions: {
          declaration: false,
        }
      }),
      ...plugins,
    ],
  },
  {
    input: 'src/hooks/index.ts',
    output: {
      exports: 'named',
      file: 'dist/hooks/index.modern.js',
      format: 'es',
      sourcemap: false,
    },
    external: ['react'],
    plugins: [
      externalAlias({
        '@core': { output: '../core/index.modern.js' },
        '@utils': { output: '../utils/index.modern.js' },
      }),
      commonjs(),
      typescript({
        ...tsOptions,
        compilerOptions: {
          declaration: false,
        }
      }),
      ...plugins,
    ],
  },
  {
    input: 'src/utils/index.ts',
    output: {
      exports: 'named',
      file: 'dist/utils/index.modern.js',
      format: 'es',
      sourcemap: false,
    },
    plugins: [
      commonjs(),
      typescript({
        ...tsOptions,
        compilerOptions: {
          declaration: false,
        }
      }),
      ...plugins,
    ],
  },
];
