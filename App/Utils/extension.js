import {Dimensions, Platform} from 'react-native';
import moment from 'moment';
import Value from './Value';
import Geolocation from 'react-native-geolocation-service';
import base64 from 'react-native-base64';

const myEncodedApiKey = 'QUl6YVN5QXRELTVkRzhPa1U4MlRJWTAwa1VtUFQtVUtkaHp3SlE0';
const API_KEY = base64.decode(myEncodedApiKey);

export function getCurrentPosition() {
  return new Promise(function (resolve, reject) {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });
  });
}

export function getStartEndDateString(startDate, endDate) {
  return `${moment(startDate).format('DD MMM yyyy')} - ${moment(endDate).format(
    'DD MMM yyyy',
  )}`;
}

export function getSearchDateString(date) {
  return `${moment(date).format('DD MMM yyyy')}`;
}

export function isChecked(reservation) {
  return reservation.Status === 'Checked-in';
}

export function getTodayReservationCount(reservations) {
  const filterArray = reservations.filter(
    (v) =>
      moment(v.CheckInOpen) < moment() &&
      moment(v.CheckInClosing) > moment() &&
      v.Area != null &&
      v.Status !== 'Checked-in',
  );
  return filterArray.length;
}

export function getAvailableReservationList(reservations) {
  const filterArray = reservations.filter(
    (v) =>
      moment(v.CheckInOpen) < moment() &&
      moment(v.CheckInClosing) > moment() &&
      v.Area != null,
  );
  return filterArray;
}

export function getTodayReservation(reservations) {
  const filterArray = reservations.filter(
    (v) =>
      moment(v.Date).format('yyyy-MM-DD') === moment().format('yyyy-MM-DD') &&
      v.Area != null,
  );
  console.log(filterArray);
  if (filterArray.length === 0) {
    return null;
  } else {
    return filterArray[0];
  }
}

export function getTodayHomeReservation(reservations) {
  const filterArray = reservations.filter(
    (v) =>
      moment(v.Date).format('yyyy-MM-DD') === moment().format('yyyy-MM-DD'),
  );
  console.log(filterArray);
  if (filterArray.length === 0) {
    return null;
  } else {
    return filterArray[0];
  }
}

export function getDateArray(s, e) {
  const startDate = new Date(s);
  const endDate = new Date(e);
  var dateArray = [];
  var currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateArray;
}

export function isBefore(date1, date2) {
  return moment(date2).toDate() - moment(date1).toDate();
}

export function getSTime(date) {
  return moment(date).format('yyyy-MM-DD');
}

export function getLTime(date) {
  return moment(date).format('DD-MMM-yyyy');
}

export function convertSTimeToLMonth(date) {
  return moment(date).format('MMM');
}

export function convertSTimeToLDay(date) {
  return moment(date).format('DD');
}

export function getSTimeForPost(date) {
  return moment(date).format('yyyy-MM-DD HH:MM:ss').replace(' ', 'T');
}

export function getGuestsCount(guests) {
  if (guests == null) {
    return 0;
  }
  return guests.length;
}

export function xCoordinateForSeat(
  xPosition,
  reservationOriginMapWidth,
  reservationOriginMapHeight,
  reservationMapWidth = Value.reservationMapWidth,
  reservationMapHeight = Value.reservationMapHeight,
) {
  if (
    reservationMapWidth / reservationOriginMapWidth >
    reservationMapHeight / reservationOriginMapHeight
  ) {
    const reservationScale = reservationMapHeight / reservationOriginMapHeight;
    const padding =
      reservationMapWidth - reservationScale * reservationOriginMapWidth;
    return xPosition * reservationScale + padding / 2 - Value.seatRangeSize / 2;
  } else {
    const reservationScale = reservationMapWidth / reservationOriginMapWidth;

    return xPosition * reservationScale - Value.seatRangeSize / 2;
  }
}

export function yCoordinateForSeat(
  yPosition,
  reservationOriginMapWidth,
  reservationOriginMapHeight,
  reservationMapWidth = Value.reservationMapWidth,
  reservationMapHeight = Value.reservationMapHeight,
) {
  if (
    reservationMapWidth / reservationOriginMapWidth >
    reservationMapHeight / reservationOriginMapHeight
  ) {
    const reservationScale = reservationMapHeight / reservationOriginMapHeight;
    return yPosition * reservationScale - Value.seatRangeSize / 2;
  } else {
    const reservationScale = reservationMapWidth / reservationOriginMapWidth;
    const padding =
      reservationMapHeight - reservationScale * reservationOriginMapHeight;
    return yPosition * reservationScale - Value.seatRangeSize / 2 + padding / 2;
  }
}

export function xCoordinate(
  xPosition,
  calcWidth,
  reservationOriginMapWidth,
  reservationOriginMapHeight,
  reservationMapWidth = Value.reservationMapWidth,
  reservationMapHeight = Value.reservationMapHeight,
) {
  if (
    reservationMapWidth / reservationOriginMapWidth >
    reservationMapHeight / reservationOriginMapHeight
  ) {
    const reservationScale = reservationMapHeight / reservationOriginMapHeight;
    const padding =
      reservationMapWidth - reservationScale * reservationOriginMapWidth;

    return xPosition * reservationScale + padding / 2 - (calcWidth + 12) / 2;
  } else {
    const reservationScale = reservationMapWidth / reservationOriginMapWidth;

    return xPosition * reservationScale - (calcWidth + 12) / 2;
  }
}

export function yCoordinate(
  yPosition,
  calcHeight,
  reservationOriginMapWidth,
  reservationOriginMapHeight,
  reservationMapWidth = Value.reservationMapWidth,
  reservationMapHeight = Value.reservationMapHeight,
) {
  if (
    reservationMapWidth / reservationOriginMapWidth >
    reservationMapHeight / reservationOriginMapHeight
  ) {
    const reservationScale = reservationMapHeight / reservationOriginMapHeight;

    return yPosition * reservationScale - Value.mapPinSize - calcHeight;
  } else {
    const reservationScale = reservationMapWidth / reservationOriginMapWidth;

    const padding =
      reservationMapHeight - reservationScale * reservationOriginMapHeight;

    return (
      yPosition * reservationScale - Value.mapPinSize - calcHeight + padding / 2
    );
  }
}

export function myXCoordination(
  xPosition,
  reservationOriginMapWidth,
  reservationOriginMapHeight,
  reservationMapWidth = Value.reservationMapWidth,
  reservationMapHeight = Value.reservationMapHeight,
) {
  if (
    reservationMapWidth / reservationOriginMapWidth >
    reservationMapHeight / reservationOriginMapHeight
  ) {
    const reservationScale = reservationMapHeight / reservationOriginMapHeight;
    const padding =
      reservationMapWidth - reservationScale * reservationOriginMapWidth;
    return (
      xPosition * reservationScale + padding / 2 - Value.myMapMarkerSize / 2
    );
  } else {
    const reservationScale = reservationMapWidth / reservationOriginMapWidth;

    return xPosition * reservationScale - Value.myMapMarkerSize / 2;
  }
}

export function myYCoordination(
  yPosition,
  reservationOriginMapWidth,
  reservationOriginMapHeight,
  reservationMapWidth = Value.reservationMapWidth,
  reservationMapHeight = Value.reservationMapHeight,
) {
  if (
    reservationMapWidth / reservationOriginMapWidth >
    reservationMapHeight / reservationOriginMapHeight
  ) {
    const reservationScale = reservationMapHeight / reservationOriginMapHeight;
    return yPosition * reservationScale - Value.myMapMarkerSize;
  } else {
    const reservationScale = reservationMapWidth / reservationOriginMapWidth;
    const padding =
      reservationMapHeight - reservationScale * reservationOriginMapHeight;
    return yPosition * reservationScale - Value.myMapMarkerSize + padding / 2;
  }
}

export function convertPosToXCoord(
  xPos,
  reservationOriginMapWidth,
  reservationOriginMapHeight,
  reservationMapWidth = Value.reservationMapWidth,
  reservationMapHeight = Value.reservationMapHeight,
) {
  if (
    reservationMapWidth / reservationOriginMapWidth >
    reservationMapHeight / reservationOriginMapHeight
  ) {
    const reservationScale = reservationMapHeight / reservationOriginMapHeight;
    const padding =
      getDeviceWidth() - reservationScale * reservationOriginMapWidth;
    return (xPos - padding / 2) / reservationScale;
  } else {
    const reservationScale = reservationMapWidth / reservationOriginMapWidth;

    return xPos / reservationScale;
  }
}

export function convertPosToYCoord(
  yPos,
  reservationOriginMapWidth,
  reservationOriginMapHeight,
  reservationMapWidth = Value.reservationMapWidth,
  reservationMapHeight = Value.reservationMapHeight,
) {
  if (
    reservationMapWidth / reservationOriginMapWidth >
    reservationMapHeight / reservationOriginMapHeight
  ) {
    const reservationScale = reservationMapHeight / reservationOriginMapHeight;
    return yPos / reservationScale;
  } else {
    const reservationScale = reservationMapWidth / reservationOriginMapWidth;
    const padding =
      reservationMapHeight - reservationScale * reservationOriginMapHeight;
    return (yPos - padding / 2) / reservationScale;
  }
}

export function getDeviceHeight() {
  return Dimensions.get('window').height;
}

export function getDeviceWidth() {
  return Dimensions.get('window').width;
}

export function isIphoneX() {
  const dim = Dimensions.get('window');

  return (
    // This has to be iOS
    Platform.OS === 'ios' &&
    // Check either, iPhone X or XR
    (isIPhoneXSize(dim) || isIPhoneXrSize(dim))
  );
}

export function isIOS() {
  return Platform.OS === 'ios';
}

export function isAndroid() {
  return Platform.OS === 'android';
}

function isIPhoneXSize(dim) {
  return dim.height === 812 || dim.width === 812;
}

function isIPhoneXrSize(dim) {
  return dim.height === 896 || dim.width === 896;
}

export async function getPlaceDetailWithCoordinates(lat, long, callback) {
  console.log(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${API_KEY}`,
  );
  var request = new XMLHttpRequest();
  request.onreadystatechange = (e) => {
    if (request.readyState !== 4) {
      return;
    }

    if (request.status === 200) {
      callback(JSON.parse(request.responseText).results);
    } else {
      console.warn('error');
    }
  };

  request.open(
    'GET',
    `https://maps.googleapis.com/maps/api/geocode/json?address=${lat},${long}&key=${API_KEY}`,
  );
  request.send();
}
