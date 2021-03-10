import React, {Component} from 'react';
import {Image} from 'react-native';
import Images from './../Utils/Images';
import ApplicationStyles from './../Utils/ApplicationStyles';
import {isIphoneX} from '../Utils/extension';

export default class MyBackGround extends Component {
  render() {
    return (
      <Image
        source={isIphoneX() ? Images.screen_back : Images.screen_back_8}
        style={ApplicationStyles.imageBack}
        resizeMode={'cover'}
      />
    );
  }
}
