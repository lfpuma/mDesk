import {all, takeEvery} from 'redux-saga/effects';
import {getToken} from '../Utils/HelperService';
import UserSaga from './UserSaga/sagas';
import * as NavigationService from './../Navigators/NavigationService';

function* checkLoginSaga() {
  getToken().then((token) => {
    if (token != null && token !== '') {
      console.log(token);
      NavigationService.navigate('Home');
    } else {
      NavigationService.navigate('Login');
    }
  });
}

export function* mainSaga() {
  yield all([takeEvery('StartUp/CHECK_LOGIN', checkLoginSaga), UserSaga]);
}
