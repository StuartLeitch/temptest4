import { Epic } from 'redux-observable';
import { StateType, ActionType } from 'typesafe-actions';

declare module "typesafe-actions" {
  export type Store = StateType<ReturnType<typeof import("./index").default>>;

  export type RootState = StateType<typeof import("./root-reducer").default>;

  export type RootAction = ActionType<typeof import('./root-actions').default>;

  export type RootEpic = Epic<RootAction, RootAction, RootState, {}>;

  interface Types {
    RootAction: RootAction;
  }
}
