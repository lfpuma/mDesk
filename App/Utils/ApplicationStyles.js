import {scale, scaleVertical} from './scale';
import {isIphoneX, isAndroid} from './extension';

export default {
  // Global
  fullView: {
    flex: 1,
  },

  imageBack: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  spinOverLay: {
    padding: 30,
    borderRadius: 15,
  },

  // Home
  homeMainView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 28,
    position: 'absolute',
  },

  // Header
  headerView: {
    width: '100%',
    height: scaleVertical(70),
    alignItems: 'center',
  },
  topLogo: {
    marginTop: isIphoneX() ? scaleVertical(30) : scaleVertical(26),
    height: scaleVertical(44),
  },

  // Header Right
  headerRight: {
    position: 'absolute',
    marginTop: isIphoneX() ? scaleVertical(38) : scaleVertical(34),
    right: scale(30),
  },
  headerRightImage: {
    width: scale(23),
    height: scale(23),
  },

  // Header Left
  headerLeft: {
    position: 'absolute',
    marginTop: isIphoneX() ? scaleVertical(38) : scaleVertical(34),
    left: scale(30),
  },

  // Fonts
  regularFont: {
    fontFamily: 'Poppins-Regular',
  },
  semiBoldFont: {
    fontFamily: isAndroid() ? 'Poppins-SemiBold' : 'Poppins-Semibold',
  },
  boldFont: {
    fontFamily: 'Poppins-Bold',
  },
  mediumFont: {
    fontFamily: 'Poppins-Medium',
  },
};
