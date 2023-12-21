"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = void 0;
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const path_1 = __importDefault(require("path"));
const cells_1 = require("./routes/cells");
// NOTE: this function is imported and executed by the cli to start the server.
const serve = (port, filename, dir, useProxy) => {
    const app = (0, express_1.default)();
    app.use((0, cells_1.createCellsRouter)(filename, dir));
    // when running app during development, we redirect requests to react dev server to access our files
    if (useProxy) {
        app.use((0, http_proxy_middleware_1.createProxyMiddleware)({
            // react dev server is running on port 3000:
            target: 'http://127.0.0.1:3000',
            // enable websockets (used by react dev server to detect file changes)
            ws: true,
            logLevel: 'silent',
        }));
    }
    else {
        // serve static build files directly (if we publish this CLI tool to npm and user installs it and uses it locally - no need for the extra overhead of react dev server)
        // resolve the absolute path of the @jsnote/local-client and provide it to express.static
        const packagePath = require.resolve('@jsnote/local-client/build/index.html');
        app.use(express_1.default.static(path_1.default.dirname(packagePath)));
    }
    // promisify app.listen so that errors can be caught in try catch
    return new Promise((resolve, reject) => {
        app.listen(port, resolve).on('error', reject);
    });
};
exports.serve = serve;
