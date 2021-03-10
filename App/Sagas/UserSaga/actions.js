import * as actions from './constants';

export const getProfile = () => ({
  type: actions.USER_PROFILE_REQUEST,
});

export const updateMyReservation = () => ({
  type: actions.UPDATE_MY_RESERVATION_REQUEST,
});

export const updateMyLunch = () => ({
  type: actions.UPDATE_MY_LUNCH_REQUEST,
});

export const updateLocation = (currentLocation) => ({
  type: actions.UPDATE__CURRENT_LOCATION_REQUEST,
  currentLocation,
});

export const updateMyTeamList = () => ({
  type: actions.UPDATE_MY_TEAM_LIST_REQUEST,
});

export const updateReservationListScreenStatus = (index) => ({
  type: actions.UPDATE_MY_RESERVATION_STATUS,
  index,
});

export const updateCurrentGuestList = (reservationId) => ({
  type: actions.UPDATE_CURRENT_GUEST_LIST,
  reservationId,
});

export const updateMyReservationWithGuests = (reservationId) => ({
  type: actions.UPDATE_MY_RESERVATION_WITH_GUESTS,
  reservationId,
});

export const refreshIdToken = (isRefresh) => ({
  type: actions.REFRESH_ID_TOKEN,
  isRefresh,
});
