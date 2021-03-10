import {combineReducers} from 'redux';

import UserReducer from './UserSaga/reducers';

export const combinedReducers = combineReducers({
  blank: (state, action) => {
    if (state == null) {
      state = [];
    }
    return state;
  },

  User: UserReducer,
});
