import './resizable.css';
import { useEffect, useState } from 'react';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';

interface ResizableProps {
  direction: 'horizontal' | 'vertical';
  children?: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
  let resizableProps: ResizableBoxProps;
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [width, setWidth] = useState(window.innerWidth * 0.75);

  useEffect(() => {
    let timer: any;

    const listener = () => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        // recalculate window width + height whenever user resizes the window
        setInnerHeight(window.innerHeight);
        setInnerWidth(window.innerWidth);
        if (window.innerWidth * 0.75 < width) {
          setWidth(window.innerWidth * 0.75);
        }
      // debounce to prevent too many re-renders + lag
      }, 100);
    };
    window.addEventListener('resize', listener);

    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [width]);

  // NOTE: we are using Infinity as a value because react-resizable doesn't support percentages so we cant set 100%
  if (direction === 'horizontal') {
    resizableProps = {
      className: 'resize-horizontal',
      // 20% of window width
      minConstraints: [innerWidth * 0.2, Infinity],
      // 75% of window width
      maxConstraints: [innerWidth * 0.75, Infinity],
      height: Infinity,
      width,
      // add draggable handle to the right
      resizeHandles: ['e'],
      onResizeStop: (event, data) => {
        setWidth(data.size.width);
      },
    };
  } else {
    resizableProps = {
      // can shrink vertically to 24px (not any lower)
      minConstraints: [Infinity, 24],
      // can resize vertically up to 90% of window height (dont want to resize completely off the screen)
      maxConstraints: [Infinity, innerHeight * 0.9],
      height: 300,
      width: Infinity,
      // add draggable handle to the bottom
      resizeHandles: ['s'],
    };
  }

  return <ResizableBox {...resizableProps}>{children}</ResizableBox>;
};

export default Resizable;
