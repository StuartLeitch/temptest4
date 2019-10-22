import { Article } from "@hindawi/shared";

export interface StateType {
  readonly manuscript: Article | null;
}

export const initialState: StateType = {
  manuscript: null,
};
