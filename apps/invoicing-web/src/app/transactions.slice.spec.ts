import {
  transactionsReducer,
  getTransactionsStart,
  getTransactionsFailure,
  getTransactionsSuccess,
} from "./transactions.slice";

describe("transactions reducer", () => {
  it("should handle initial state", () => {
    expect(transactionsReducer(undefined, { type: "" })).toMatchObject({
      entities: [],
    });
  });

  it("should handle get transactions actions", () => {
    let state = transactionsReducer(undefined, getTransactionsStart());

    expect(state).toEqual({
      loaded: false,
      error: null,
      entities: [],
    });

    state = transactionsReducer(state, getTransactionsSuccess([{ id: 1 }]));

    expect(state).toEqual({
      loaded: true,
      error: null,
      entities: [{ id: 1 }],
    });

    state = transactionsReducer(state, getTransactionsFailure("Uh oh"));

    expect(state).toEqual({
      loaded: true,
      error: "Uh oh",
      entities: [{ id: 1 }],
    });
  });
});
