import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { createCellsRouter } from './routes/cells';

// NOTE: this function is imported and executed by the cli to start the server.
export const serve = (
  port: number,
  filename: string,
  dir: string,
  useProxy: boolean
) => {
  const app = express();

  app.use(createCellsRouter(filename, dir));

  // when running app during development, we redirect requests to react dev server to access our files
  if (useProxy) {
    app.use(
      createProxyMiddleware({
        // react dev server is running on port 3000:
        target: 'http://127.0.0.1:3000',
        // enable websockets (used by react dev server to detect file changes)
        ws: true,
        logLevel: 'silent',
      })
    );
  } else {
    // serve static build files directly (if we publish this CLI tool to npm and user installs it and uses it locally - no need for the extra overhead of react dev server)

    // resolve the absolute path of the @jsnote/local-client and provide it to express.static
    const packagePath = require.resolve(
      '@jsnote/local-client/build/index.html'
    );

    app.use(express.static(path.dirname(packagePath)));
  }

  // promisify app.listen so that errors can be caught in try catch
  return new Promise<void>((resolve, reject) => {
    app.listen(port, resolve).on('error', reject);
  });
};
