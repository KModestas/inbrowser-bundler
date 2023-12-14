import { useTypedSelector } from './use-typed-selector';

export const useCumulativeCode = (cellId: string) => {
  return useTypedSelector((state) => {
    const { data, order } = state.cells;

    const orderedCells = order.map((id) => data[id]);

    const showFunc = `
    import _React from 'react';
    import _ReactDOM from 'react-dom';
    var show = (value) => {
      const root = document.querySelector('#root');

      if (typeof value === 'object') {
        if (value.$$typeof && value.props) {
          _ReactDOM.render(value, root);
        } else {
          root.innerHTML = JSON.stringify(value);
        }
      } else {
        root.innerHTML = value;
      }
    };
  `;

    const emptyShowFunc = 'var show = () => {}';
    const cumulativeCode = [];

    for (const cell of orderedCells) {
      const isCurrentCell = cell.id === cellId

      if (cell.type === 'code') {
        // the show() function should only render content in the cell its called in.
        if (isCurrentCell) cumulativeCode.push(showFunc);
        // show fucntions from previous cells should be cleared so they dont accumulate into later cells
        else cumulativeCode.push(emptyShowFunc);

        cumulativeCode.push(cell.content);
      }

      // stop when you reach current cell. Each code cell will include code from previous cells but not later cells
      if (isCurrentCell) break;
    }
    return cumulativeCode;
  }).join('\n'); // join code from all cells with empty space
};
