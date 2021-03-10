import React, {Component} from 'react';
import {Image} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {StyleSheet} from 'react-native';
import Images from '../Utils/Images';
import {scale} from '../Utils/scale';

export default class MapZoomCancelButton extends Component {
  render() {
    if (!this.props.isEnabled) {
      return null;
    }

    return (
      <TouchableOpacity style={styles.container} onPress={this.props.onPress}>
        <Image
          style={styles.backImage}
          source={Images.ic_close}
          resizeMode={'contain'}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: scale(16),
    top: scale(10),
  },
  backImage: {
    width: scale(24),
    height: scale(24),
  },
});
