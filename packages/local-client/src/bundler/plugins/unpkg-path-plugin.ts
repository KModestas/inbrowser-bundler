import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // Override Esbuilds default path resolution step to find the root 'index.js' entry file
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' };
      });

      // Handle relative paths in a module e.g. ./ and ../
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: 'a',
          // format the correct unpkg URL for this relative file 
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/')
            .href,
        };
      });

      // Handle main entry file of each module
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          // e.g. if we encounter an import for 'react'
          path: `https://unpkg.com/${args.path}`,
        };
      });

      // NOTE: These steps are repeated for every file that gets imported during the build process when Esbuild goes down the rabbit hole of the main entry file
    },
  };
};
