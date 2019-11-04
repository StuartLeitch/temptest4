import { User } from "../../../../../../../libs/shared/src/lib/modules/users/domain/User";

import CONSTANTS from "./constants";
import { initialState, StateType } from "./state";

type StateSlice = StateType["user"];

export interface ActionType {
  type: string;
}

export interface FetchUserActionType {
  type: string;
  user: User | null;
}

export interface FetchUsersActionType {
  type: string;
  payload: User | null;
}

export const userSelector = (state: StateType): StateSlice => state.user;

const fetchHandler = (state: StateSlice, action: FetchUsersActionType): StateType["user"] =>
  action.payload;

export const user = (
  state: StateSlice = initialState.user,
  action: FetchUsersActionType,
): StateSlice => {
  switch (action.type) {
    case CONSTANTS.FETCH_FULFILLED:
      return fetchHandler(state, action);
    default:
      return state;
  }
};
