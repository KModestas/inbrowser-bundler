import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    // build arg let's us interact with / intercept the build process with our code
    // Esbuild will invoke and run our onResolve + onLoad instead
    setup(build: esbuild.PluginBuild) {
      // Override Esbuilds default path resolution step to find the 'index.js' entry file
      // filter controls which files onResolve will be executed on
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' };
      });

      // Handle relative paths in a module e.g. ./ and ../
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: 'a',
          // prepend url 
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/')
            .href,
        };
      });

      // Handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          // instead make it download the entry file from unpkg
          path: `https://unpkg.com/${args.path}`,
        };
      });

      // These steps are repeated for each file that gets imported during the build process when Esbuild goes down the rabbit hole of the entry file
    },
  };
};
