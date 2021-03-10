import {Dimensions} from 'react-native';
import {isIphoneX} from './extension';
import {scale, scaleVertical} from './scale';

export default {
  mainViewOpacity: 0.05,
  mainRadius: 30,
  subViewRadius: 24,
  spinColor: '#000000',

  // For reservation
  reservationMapHeight: isIphoneX() ? scaleVertical(240) : scaleVertical(240),
  reservationMapWidth: Dimensions.get('window').width,
  reservationOriginMapHeight: 639,
  reservationOriginMapWidth: 729,
  mapPinSize: scaleVertical(16),
  mapPinTextSize: scaleVertical(10),
  mapPinLeftPadding: scale(3),
  mapPinTopPadding: scaleVertical(1),

  // For My Reservation Location
  myMapMarkerSize: scaleVertical(20),

  // Seat
  seatRangeSize: scale(22),

  // Zooming
  maximumZoomScale: 4,
  minimumZoomScale: 1,
};
