import './code-preview.css';
import { useRef, useEffect } from 'react';

interface CodePreviewProps {
  code: string;
  err: string;
}

// iframe code with: 
// event listener to recieve bundled code and execute it with eval()
// event listener to capture async callback errors that are executed outside of context the try catch block
const html = `
    <html>
      <head>
        <style>html { background-color: white; }</style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          const handleError = (err) => {
            const root = document.querySelector('#root');
            root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
            console.error(err);
          };

          window.addEventListener('error', (event) => {
            event.preventDefault();
            handleError(event.error);
          });

          window.addEventListener('message', (event) => {
            try {
              eval(event.data);
            } catch (err) {
              handleError(err);
            }
          }, false);
        </script>
      </body>
    </html>
  `;

const CodePreview: React.FC<CodePreviewProps> = ({ code, err }) => {
  const iframe = useRef<any>();

  useEffect(() => {
    // reset iframe whenever code is rebundled
    iframe.current.srcdoc = html;
    setTimeout(() => {
      // emit message to the iframe, passing in all of the bundled code (delay by 50ms to allow new html srcDoc to be rendered)
      iframe.current.contentWindow.postMessage(code, '*');
    }, 50);
  }, [code]);

  return (
    <div className="preview-wrapper">
      <iframe
        title="preview"
        ref={iframe}
        // allow iframe to execute JS code
        sandbox="allow-scripts"
        // srcDoc allows us to pass a HTML string rather than loading an external HTMl file via src
        srcDoc={html}
      />
      {/* display bundling error: */}
      {err && <div className="preview-error">{err}</div>}
    </div>
  );
};

export default CodePreview;
