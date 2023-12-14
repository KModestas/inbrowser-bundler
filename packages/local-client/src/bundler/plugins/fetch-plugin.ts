import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

// cache all files in browsers IndexedDB
const fileCache = localForage.createInstance({
  name: 'filecache',
});

// this plugin in used to intercept ESBuilds file loading process. Loading a file means reading its contents from the disk (or other sources) into memory
export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      // rather than ESBuild attempting to load the contents of the root index.js file, we instead intercept and return the users inputCode (which may contain imports to various npm packages which themselves contain various imports)
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: 'jsx',
          contents: inputCode,
        };
      });

      // this filter will matches all files. Whenever EsBuild attemps to load a file, it attempt to retrieve it from the browsers IndexedDB 
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        if (cachedResult) {
          return cachedResult;
        }
      });

      // handle CSS files
      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        // fetch file contents from unpkg
        const { data, request } = await axios.get(args.path);

        // escape contents of CSS file so that it doesn't close our contents string below
        const escaped = data
          .replace(/\n/g, '')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");

        // each CSS file contents will be embedded in the final js bundle:
        const contents = `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style);
        `;

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        // cache the result 
        await fileCache.setItem(args.path, result);

        return result;
      });

      // handle all other files
      // NOTE: EsBuild will only run onLoad once for a file (the first one that matches the filter) so this onLoad will not run for CSS files:
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // fetch file contents from unpkg
        const { data, request } = await axios.get(args.path);

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        // cache the result 
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
