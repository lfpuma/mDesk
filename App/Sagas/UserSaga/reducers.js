import * as actions from './constants';

const initialState = {
  user: {},
  currentLocation: {
    latitude: 55.676098,
    longitude: 12.568337,
  },
  currentGuestList: [],
  reservations: [],
  lunches: [],
  reservationListSelIndex: -1,
  myTeamList: [],
  error: null,
  isRefresh: false,
  isLoading: false,
  isRefreshToken: false,
};

// eslint-disable-next-line no-undef
export default UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.USER_PROFILE_SUCCESS:
      return {...state, user: action.user};
    case actions.USER_PROFILE_ERROR:
      return {...state, error: action.error};
    // COMMON
    case actions.UPDATE_ANY_ERROR:
      return {...state, error: action.error, isRefresh: false};
    // Reservation
    case actions.UPDATE_MY_RESERVATION_SUCCESS:
      return {...state, reservations: action.reservations, isRefresh: false};
    case actions.UPDATE_MY_RESERVATION_ERROR:
      return {...state, error: action.error, isRefresh: false};
    case actions.UPDATE_MY_RESERVATION_STATUS:
      return {...state, reservationListSelIndex: action.index};
    // Lunch
    case actions.UPDATE_MY_LUNCH_SUCCESS:
      return {...state, lunches: action.lunches, isRefresh: false};
    // My Team
    case actions.UPDATE_MY_TEAM_LIST_SUCCESS:
      return {...state, myTeamList: action.myTeamList, isRefresh: false};
    case actions.UPDATE_MY_TEAM_LIST_ERROR:
      return {...state, error: action.error, isRefresh: false};
    case actions.UPDATE_REFRESH_STATUS:
      return {...state, isRefresh: true};
    case actions.UPDATE__CURRENT_LOCATION_REQUEST:
      return {...state, currentLocation: action.currentLocation};
    case actions.UPDATE_CURRENT_GUEST_LIST:
      const selectedReservation = state.reservations.filter(
        (item) => item.Id === action.reservationId,
      );
      return {
        ...state,
        currentGuestList:
          selectedReservation.length === 0 ? [] : selectedReservation[0].Guests,
      };
    case actions.REFRESH_ID_TOKEN:
      return {...state, isRefreshToken: action.isRefresh};
    default:
      return {...state, isLoading: false};
  }
};
