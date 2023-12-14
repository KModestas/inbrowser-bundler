import { Dispatch } from 'redux';
import { Action } from '../actions';
import { ActionType } from '../action-types';
import { saveCells } from '../action-creators';
import { RootState } from '../reducers';

export const persistMiddlware = ({
  dispatch,
  getState,
}: {
  dispatch: Dispatch<Action>;
  getState: () => RootState;
}) => {
  let timer: any;

  return (next: (action: Action) => void) => {
    return (action: Action) => {
      // pass the action to the next middleware in the chain
      next(action);

      if (
        // detect all actions that updates a cell
        [
          ActionType.MOVE_CELL,
          ActionType.UPDATE_CELL,
          ActionType.INSERT_CELL_AFTER,
          ActionType.DELETE_CELL,
        ].includes(action.type)
      ) {
        if (timer) clearTimeout(timer);

        // save cells (send to local API to perist to file)
        timer = setTimeout(() => {
          // saveCells is a thunk so we have to invoke the inner func ()()
          saveCells()(dispatch, getState);
          // debounce so that this is not triggered too often
        }, 250);
      }
    };
  };
};
