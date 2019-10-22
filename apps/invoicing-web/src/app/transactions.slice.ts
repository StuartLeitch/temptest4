import { createSlice, createSelector, Action, PayloadAction } from "redux-starter-kit";
import { ThunkAction } from "redux-thunk";

export const TRANSACTIONS_FEATURE_KEY = "transactions";

/*
 * Change this from `any` if there is a more specific error type.
 */
export type TransactionsError = any;

/*
 * Update these interfaces according to your requirements.
 */
export interface TransactionsEntity {
  id: number;
}

export interface TransactionsState {
  entities: TransactionsEntity[];
  loaded: boolean;
  error: TransactionsError;
}

export const initialTransactionsState: TransactionsState = {
  entities: [],
  loaded: false,
  error: null,
};

export const transactionsSlice = createSlice({
  slice: TRANSACTIONS_FEATURE_KEY,
  initialState: initialTransactionsState as TransactionsState,
  reducers: {
    getTransactionsStart: (state, action: PayloadAction<undefined>) => {
      state.loaded = false;
    },
    getTransactionsSuccess: (state, action: PayloadAction<TransactionsEntity[]>) => {
      state.loaded = true;
      state.entities = action.payload;
    },
    getTransactionsFailure: (state, action: PayloadAction<TransactionsError>) => {
      state.error = action.payload;
    },
  },
});

/*
 * Export reducer for store configuration.
 */
export const transactionsReducer = transactionsSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * const dispatch = useDispatch();
 * dispatch(getTransactionsSuccess([{ id: 1 }]));
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const {
  getTransactionsStart,
  getTransactionsSuccess,
  getTransactionsFailure,
} = transactionsSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * const entities = useSelector(selectTransactionsEntities);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
export const getTransactionsState = (rootState: any): TransactionsState =>
  rootState[TRANSACTIONS_FEATURE_KEY];

export const selectTransactionsEntities = createSelector(
  getTransactionsState,
  s => s.entities,
);

export const selectTransactionsLoaded = createSelector(
  getTransactionsState,
  s => s.loaded,
);

export const selectTransactionsError = createSelector(
  getTransactionsState,
  s => s.error,
);

/*
 * Export default effect, handled by redux-thunk.
 * You can replace this with your own effects solution.
 */
export const fetchTransactions = (): ThunkAction<
  void,
  any,
  null,
  Action<string>
> => async dispatch => {
  try {
    dispatch(getTransactionsStart());
    // Replace this with your custom fetch call.
    // For example, `const data = await myApi.getTransactions`;
    // Right now we just load an empty array.
    const data = [];
    dispatch(getTransactionsSuccess(data));
  } catch (err) {
    dispatch(getTransactionsFailure(err));
  }
};
