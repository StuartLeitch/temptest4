import { createReducer } from "typesafe-actions";

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

const initialLoading: LoadingState = {
  loading: false,
  error: null,
};

export function createLoadingReducer(actions, startLoading = false) {
  return createReducer({ ...initialLoading, loading: startLoading })
    .handleAction(
      actions.request,
      (): LoadingState => ({ loading: true, error: null }),
    )
    .handleAction(
      actions.success,
      (): LoadingState => ({
        loading: false,
        error: null,
      }),
    )
    .handleAction(
      actions.failure,
      (_, action): LoadingState => ({
        loading: false,
        error: action.payload,
      }),
    );
}
