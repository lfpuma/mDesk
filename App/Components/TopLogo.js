import React, {Component} from 'react';
import {Image} from 'react-native';
import Images from './../Utils/Images';
import ApplicationStyles from './../Utils/ApplicationStyles';

export default class TopLogo extends Component {
  render() {
    return (
      <Image
        source={Images.logo_white}
        style={ApplicationStyles.topLogo}
        resizeMode={'contain'}
      />
    );
  }
}
