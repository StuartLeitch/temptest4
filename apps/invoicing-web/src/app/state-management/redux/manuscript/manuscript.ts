import { createSelector } from "reselect";
import { Article } from "@hindawi/shared";

import CONSTANTS from "./constants";
import { initialState, StateType } from "./state";

type StateSlice = StateType["manuscript"];

export interface ActionType {
  type: string;
}

export interface FetchManuscriptActionType {
  type: string;
  payload: Article | null;
}

const getManuscript = (state: StateType): StateSlice => state.manuscript;
export const selectAuthor = createSelector(
  getManuscript,
  (manuscript: any) => {
    if (!manuscript) {
      return null;
    } else {
      return {
        name: manuscript.authorSurname,
        email: manuscript.authorEmail,
        country: manuscript.authorCountry,
      };
    }
  },
);
export const selectManuscript = createSelector(
  getManuscript,
  (manuscript: any) => {
    if (!manuscript) {
      return null;
    } else {
      return {
        id: manuscript.id,
        title: manuscript.title,
      };
    }
  },
);

const fetchHandler = (
  state: StateSlice,
  action: FetchManuscriptActionType,
): StateType["manuscript"] => {
  return action.payload;
};

export const manuscript = (
  state: StateSlice = initialState.manuscript,
  action: FetchManuscriptActionType,
): StateSlice => {
  switch (action.type) {
    case CONSTANTS.FETCH_FULFILLED:
      return fetchHandler(state, action);
    default:
      return state;
  }
};
