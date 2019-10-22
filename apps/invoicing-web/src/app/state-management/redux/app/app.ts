import CONSTANTS from "./constants";
import { initialState, StateType } from "./state";

type StateSlice = StateType["app"];

export interface ActionType {
  type: string;
}

export interface InitActionType {
  type: string;
  app: any | null;
}

export const appSelector = (state: StateType): StateSlice => state.app;

const initHandler = (state: StateSlice, action: InitActionType): StateType["app"] => {
  return action.app;
};

export const app = (state: StateSlice = initialState.app, action: InitActionType): StateSlice => {
  switch (action.type) {
    case CONSTANTS.INIT_FULFILLED:
      return initHandler(state, action);
    default:
      return state;
  }
};
