import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { RootAction, RootState } from 'typesafe-actions';

import { Context } from '@hindawi/invoicing-web/context';
import { Config } from '@hindawi/invoicing-web/config';

import rootReducer from './root-reducer';
import rootEpic from './root-epic';


export default function makeStore(config: Config, context: Context) {
  const composeEnhancers =
    (config.env === 'development' &&
     window &&
     (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
     compose;


  const epicMiddleware = createEpicMiddleware<RootAction, RootAction, RootState, Context>({
    dependencies: context,
  });

  // configure middlewares
  const middlewares = [epicMiddleware];

  // compose enhancers
  const enhancer = composeEnhancers(applyMiddleware(...middlewares));

  // rehydrate state on app start
  const initialState = {};

  // create store
  const store = createStore(rootReducer, initialState, enhancer);

  epicMiddleware.run(rootEpic);
  return store;
}
