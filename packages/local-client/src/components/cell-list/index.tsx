import './index.css';
import { Fragment, useEffect } from 'react';
import { useTypedSelector } from '../../hooks/use-typed-selector';
import CellItem from '../cell';
import AddCell from '../add-cell';
import { useActions } from '../../hooks/use-actions';

const CellList: React.FC = () => {
  // typedSelector is like mapStateToProps for vanilla redux + hooks + Ts
  const cells = useTypedSelector(({ cells: { order, data } }) =>
    // return each cell in the correct order
    order.map((id) => data[id])
  );
  const { fetchCells } = useActions();

  useEffect(() => {
    fetchCells();
  }, []);

  const renderedCells = cells.map((cell) => (
    <Fragment key={cell.id}>
      <CellItem cell={cell} />
      <AddCell insertAfterCellId={cell.id} />
    </Fragment>
  ));

  return (
    <div className="cell-list">
      {/* A single AddCell should always be visible incase there are currently no cells */}
      <AddCell forceVisible={cells.length === 0} insertAfterCellId={null} />
      {renderedCells}
    </div>
  );
};

export default CellList;
