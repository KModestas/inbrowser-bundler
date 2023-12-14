import path from 'path';
import { Command } from 'commander';
import { serve } from '@jsnote/local-api';

const isProduction = process.env.NODE_ENV === 'production';

interface LocalApiError {
  code: string;
}

export const serveCommand = new Command()
  // [optional] value. 
  .command('serve [filename]')
  .description('Open a file for editing')
  // <required> value
  // 1st + 2nd arg are different aliases, 3rd arg is a description, 4th arg is a default value
  .option('-p, --port <number>', 'port to run server on', '4005')
  // run logic when the command is executed:
  // positional arguments are passed as the first arguments. followed by options (arguments with flags)
  .action(async (filename = 'notebook.js', options: { port: string }) => {
    // TS predicate (needed to satisfy TS)
    const isLocalApiError = (err: any): err is LocalApiError => {
      return typeof err.code === 'string';
    };

    try {
      // if user enters a path as a filename  e.g. path/to/myfile.txt 
      const dir = path.join(process.cwd(), path.dirname(filename)); // => path/to
      // extract just the filename from the path:
      const file = path.basename(filename) // => filename.txt

      await serve(
        parseInt(options.port),
        file,
        dir,
        !isProduction
      );

      // print message to user
      console.log(
        `Opened ${filename}. Navigate to http://localhost:${options.port} to edit the file.`
      );
    } catch (err) {
      // if user is already running the app, show a more friendly error:
      if (isLocalApiError(err)) {
        if (err.code === 'EADDRINUSE') console.error('Port is in use. Try running on a different port.');
      }

      if (err instanceof Error) console.log(err.message);

      process.exit(1);
    }
  });
