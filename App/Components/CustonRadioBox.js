import React, {Component} from 'react';
import {Image} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {StyleSheet} from 'react-native';
import Images from '../Utils/Images';
import {scale} from '../Utils/scale';

export default class CustomRadioBox extends Component {
  render() {
    return (
      <TouchableOpacity
        disabled={this.props.disabled ?? false}
        style={styles.container}
        onPress={this.props.onPress}>
        <Image
          style={styles.backImage}
          source={Images.ic_radio_back}
          resizeMode={'contain'}
        />
        {this.props.isChecked && (
          <Image
            style={styles.checkImage}
            source={Images.ic_radio_check}
            resizeMode={'contain'}
          />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
  backImage: {
    width: scale(22),
    height: scale(22),
  },
  checkImage: {
    position: 'absolute',
    width: scale(20),
    height: scale(20),
    top: scale(1),
    left: scale(2),
  },
});
