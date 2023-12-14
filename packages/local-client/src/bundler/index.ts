import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

// initialise the EsBuild bundler once in a global variable:
let service: esbuild.Service;

const bundle = async (rawCode: string) => {
  if (!service) {
    service = await esbuild.startService({
      worker: true,
      // fetch and use the web assembly binary for esbuild
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  }

  try {
    const result = await service.build({
      // NOTE: there is no index.js file, we just the literal value inside fetchPlugin to intercept the build process during the initial phase
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      // plugins are run left-right
      plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
      define: {
        // replace env variable in the code with a string of "production"
        'process.env.NODE_ENV': '"production"',
        // replace all references to global with "window" incase the module is designed to run in a node environment (webpack does this automatically)
        global: 'window',
      },
      jsxFactory: '_React.createElement',
      jsxFragment: '_React.Fragment',
    });

    return {
      code: result.outputFiles[0].text,
      err: '',
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        code: '',
        // if user entered invalid code, return error that was thrown by the bundler
        err: err.message,
      };
    } else {
      throw err;
    }
  }
};

export default bundle
