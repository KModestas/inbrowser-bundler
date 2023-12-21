"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveCommand = void 0;
const path_1 = __importDefault(require("path"));
const commander_1 = require("commander");
const local_api_1 = require("@jsnote/local-api");
const isProduction = process.env.NODE_ENV === 'production';
exports.serveCommand = new commander_1.Command()
    // [optional] value. 
    .command('serve [filename]')
    .description('Open a file for editing')
    // <required> value
    // 1st + 2nd arg are different aliases, 3rd arg is a description, 4th arg is a default value
    .option('-p, --port <number>', 'port to run server on', '4005')
    // run logic when the command is executed:
    // positional arguments are passed as the first arguments. followed by options (arguments with flags)
    .action((filename = 'notebook.js', options) => __awaiter(void 0, void 0, void 0, function* () {
    // TS predicate (needed to satisfy TS)
    const isLocalApiError = (err) => {
        return typeof err.code === 'string';
    };
    try {
        // if user enters a path as an argument to filename  e.g. path/to/myfile.txt 
        const dir = path_1.default.join(process.cwd(), path_1.default.dirname(filename)); // => path/to
        // extract just the filename from the path:
        const file = path_1.default.basename(filename); // => filename.txt
        yield (0, local_api_1.serve)(parseInt(options.port), file, dir, !isProduction);
        // print message to user
        console.log(`Opened ${filename}. Navigate to http://localhost:${options.port} to edit the file.`);
    }
    catch (err) {
        // if user is already running the app, show a more friendly error:
        if (isLocalApiError(err)) {
            if (err.code === 'EADDRINUSE')
                console.error('Port is in use. Try running on a different port.');
        }
        if (err instanceof Error)
            console.log(err.message);
        process.exit(1);
    }
}));
