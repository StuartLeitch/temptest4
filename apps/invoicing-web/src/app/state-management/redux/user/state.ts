import { User } from "../../../../../../../libs/shared/src/lib/modules/users/domain/User";

export interface StateType {
  readonly user: User | null;
}

export const initialState: StateType = {
  user: null,
};
