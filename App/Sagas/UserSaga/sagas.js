import {all, takeLatest, put, call} from 'redux-saga/effects';
import {apiManager} from '../../Network/APIManager';
import {isBefore} from '../../Utils/extension';
import {_storeName} from '../../Utils/HelperService';

import * as actions from './constants';

function* handleGetProfile(action) {
  try {
    const {status, data} = yield call(apiManager.getProfile);

    if (status === 200) {
      console.log(data);
      _storeName(data.Email ?? '');
      yield put({
        type: actions.USER_PROFILE_SUCCESS,
        user: data,
      });
    } else {
      apiManager.checkLoginStatus({status, data});
      yield put({
        type: actions.USER_PROFILE_ERROR,
        error: data.Message,
      });
    }
  } catch (error) {
    yield put({
      type: actions.USER_PROFILE_ERROR,
      error: 'Please try again later',
    });
  }
}

// Lunch
function* handleUpdateMyLunch(action) {
  yield put({type: actions.UPDATE_REFRESH_STATUS});

  try {
    const {status, data} = yield call(apiManager.getMyLunch);

    if (status === 200) {
      if (data != null) {
        // TODO -> double-check if sorting needed
        // data.sort(function (a, b) {
        //   return isBefore(b.Date, a.Date);
        // });
      }
      yield put({
        type: actions.UPDATE_MY_LUNCH_SUCCESS,
        // TODO -> remove testing codes
        // lunches: data,
        lunches: Array.from({length: 20}, (v, i) => ({id: i, isAdded: false})),
      });
    } else {
      apiManager.checkLoginStatus({status, data});
      yield put({
        type: actions.UPDATE_ANY_ERROR,
        error: data.Message,
      });
    }
  } catch (error) {
    yield put({
      type: actions.UPDATE_ANY_ERROR,
      error: 'Please try again later',
    });
  }
}

// Reservation
function* handleUpdateMyReservation(action) {
  yield put({type: actions.UPDATE_REFRESH_STATUS});

  try {
    const {status, data} = yield call(apiManager.getMyReservation);

    if (status === 200) {
      if (data != null) {
        console.log(data);
        data.sort(function (a, b) {
          return isBefore(b.Date, a.Date);
        });
      }
      yield put({
        type: actions.UPDATE_MY_RESERVATION_SUCCESS,
        reservations: data,
      });
    } else {
      apiManager.checkLoginStatus({status, data});
      yield put({
        type: actions.UPDATE_MY_RESERVATION_ERROR,
        error: data.Message,
      });
    }
  } catch (error) {
    yield put({
      type: actions.UPDATE_MY_RESERVATION_ERROR,
      error: 'Please try again later',
    });
  }
}

function* handleUpdateMyReservationWithGuests(action) {
  yield put({type: actions.UPDATE_REFRESH_STATUS});

  try {
    const {status, data} = yield call(apiManager.getMyReservation);

    if (status === 200) {
      if (data != null) {
        data.sort(function (a, b) {
          return isBefore(a.Created, b.Created);
        });
      }
      yield put({
        type: actions.UPDATE_MY_RESERVATION_SUCCESS,
        reservations: data,
      });
      yield put({
        type: actions.UPDATE_CURRENT_GUEST_LIST,
        reservationId: action.reservationId,
      });
    } else {
      apiManager.checkLoginStatus({status, data});
      yield put({
        type: actions.UPDATE_MY_RESERVATION_ERROR,
        error: data.Message,
      });
    }
  } catch (error) {
    yield put({
      type: actions.UPDATE_MY_RESERVATION_ERROR,
      error: 'Please try again later',
    });
  }
}

function* handleUpdateMyTeamList(action) {
  yield put({type: actions.UPDATE_REFRESH_STATUS});

  try {
    const {status, data} = yield call(apiManager.getTeamList);

    if (status === 200) {
      yield put({
        type: actions.UPDATE_MY_TEAM_LIST_SUCCESS,
        myTeamList: data,
      });
    } else {
      apiManager.checkLoginStatus({status, data});
      yield put({
        type: actions.UPDATE_MY_TEAM_LIST_ERROR,
        error: data.Message,
      });
    }
  } catch (error) {
    yield put({
      type: actions.UPDATE_MY_TEAM_LIST_ERROR,
      error: 'Please try again later',
    });
  }
}

export default all([
  takeLatest(actions.USER_PROFILE_REQUEST, handleGetProfile),
  takeLatest(actions.UPDATE_MY_RESERVATION_REQUEST, handleUpdateMyReservation),
  takeLatest(actions.UPDATE_MY_LUNCH_REQUEST, handleUpdateMyLunch),
  takeLatest(actions.UPDATE_MY_TEAM_LIST_REQUEST, handleUpdateMyTeamList),
  takeLatest(
    actions.UPDATE_MY_RESERVATION_WITH_GUESTS,
    handleUpdateMyReservationWithGuests,
  ),
]);
