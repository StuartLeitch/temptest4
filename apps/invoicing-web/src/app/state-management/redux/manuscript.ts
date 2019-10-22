import {Article} from '@hindawi/shared';

import CONSTANTS from './constants';
import {initialState, StateType} from './state';

type StateSlice = StateType['manuscript'];

export interface ActionType {
  type: string;
}

export interface FetchManuscriptActionType {
  type: string;
  manuscript: Article | null;
}

export const manuscriptSelector = (state: StateType): StateSlice =>
  state.manuscript;

const fetchHandler = (
  state: StateSlice,
  action: FetchManuscriptActionType
): StateType['manuscript'] => {
  return action.manuscript;
};

export const manuscript = (
  state: StateSlice = initialState.manuscript,
  action: FetchManuscriptActionType
): StateSlice => {
  switch (action.type) {
    case CONSTANTS.FETCH_FULFILLED:
      return fetchHandler(state, action);
    default:
      return state;
  }
};
