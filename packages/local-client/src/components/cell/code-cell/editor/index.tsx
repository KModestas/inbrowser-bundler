import './index.css';
import './syntax.css';
import { useRef } from 'react';
import MonacoEditor, { EditorDidMount } from '@monaco-editor/react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import codeShift from 'jscodeshift';
import Highlighter from 'monaco-jsx-highlighter';

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue }) => {
  const editorRef = useRef<any>();

  const onEditorDidMount: EditorDidMount = (getValue, monacoEditor) => {
    editorRef.current = monacoEditor;

    // onChange
    monacoEditor.onDidChangeModelContent(() => {
      onChange(getValue());
    });

    monacoEditor.getModel()?.updateOptions({ tabSize: 2 });

    // add syntax highlighting support for JSX.
    const highlighter = new Highlighter(
      // @ts-ignore
      window.monaco,
      codeShift,
      monacoEditor
    );
    // override / remove log (this library logs errors to the console for invalid code with every key stroke)
    highlighter.highLightOnDidChangeModelContent(
      () => {},
      () => {},
      undefined,
      () => {}
    );
  };

  // format code with prettier:
  const onFormatClick = () => {
    // get current value from editor
    const unformattedCode = editorRef.current.getModel().getValue();

    // format that value
    const formattedCode = prettier
      .format(unformattedCode, {
        parser: 'babel',
        plugins: [parser],
        useTabs: false,
        semi: true,
        singleQuote: true,
      })
      // remove new line character automatically added by prettier
      .replace(/\n$/, '');

    // set the formatted value back in the editor
    editorRef.current.setValue(formattedCode);
  };

  return (
    <div className="editor-wrapper">
      <button
        className="button button-format is-primary is-small"
        onClick={onFormatClick}
      >
        Format
      </button>
      <MonacoEditor
        editorDidMount={onEditorDidMount}
        value={initialValue}
        theme="dark"
        language="javascript"
        height="100%"
        options={{
          wordWrap: 'on',
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
