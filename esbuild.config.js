import { build } from 'esbuild';
// import templatePaths from './tools/get-template-paths.js';

export default ({ watch = false, production = false } = {}) =>
  build({
    bundle: true,
    entryPoints: ['./src/t2k4e.js'],
    outdir: 'dist',
    format: 'esm',
    logLevel: 'info',
    sourcemap: !production ? 'inline' : false,
    ignoreAnnotations: !production,
    minifyWhitespace: true,
    minifySyntax: true,
    drop: production ? ['console', 'debugger'] : [],
    watch,
    // define: {
    //   PATHS: JSON.stringify(templatePaths),
    // },
    // plugins: [
    //   sassPlugin({
    //     logger: {
    //       warn: () => '',
    //     },
    //   }),
    //   {
    //     name: 'external-files',
    //     setup(inBuild) {
    //       inBuild.onResolve({ filter: /(\.\/assets|\.\/fonts|\/systems)/ }, () => {
    //         return { external: true };
    //       });
    //     },
    //   },
    // ],
  });
