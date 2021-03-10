import {Dimensions} from 'react-native';
import {isIOS} from './extension';

const {width, height} = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = isIOS() ? 350 : 350;
const guidelineBaseHeight = isIOS() ? 680 : 680;

const textScale = (size) => (width / guidelineBaseWidth) * size;
const textScaleVertical = (size) => (height / guidelineBaseHeight) * size;
const textScaleModerate = (size, factor = 0.5) =>
  size + (textScale(size) - size) * factor;

export {textScale, textScaleVertical, textScaleModerate};
