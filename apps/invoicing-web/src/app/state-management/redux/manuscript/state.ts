import { Article } from "../../../../../../../libs/shared/src/lib/modules/articles/domain/Article";

export interface StateType {
  readonly manuscript: Article | null;
}

export const initialState: StateType = {
  manuscript: null,
};
