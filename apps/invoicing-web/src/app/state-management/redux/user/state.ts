import { User } from "@hindawi/shared";

export interface StateType {
  readonly user: User | null;
}

export const initialState: StateType = {
  user: null,
};
