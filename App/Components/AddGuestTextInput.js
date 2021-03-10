import ApplicationStyles from './../Utils/ApplicationStyles';
import {textScale} from './../Utils/textUtil';
import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {scale} from '../Utils/scale';
import {TouchableOpacity} from 'react-native';
import {Image} from 'react-native';
import Images from '../Utils/Images';
import {isAndroid} from '../Utils/extension';

export default class AddGuestTextInput extends React.Component {
  constructor(props) {
    super(props);
  }

  focus() {
    this.textInput && this.textInput.focus();
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          {...this.props}
          ref={(view) => (this.textInput = view)}
          placeholderTextColor={'#979797'}
          style={[styles.textInput, this.props.style]}
        />
        <View>
          <TouchableOpacity onPress={this.props.onPressUp}>
            <Image
              source={Images.ic_up_arrow}
              style={styles.arrowImage}
              resizeMode={'contain'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.onPressDown}>
            <Image
              source={Images.ic_down_arrow}
              style={styles.arrowImage}
              resizeMode={'contain'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderColor: '#707070',
    borderWidth: 1,
    borderRadius: scale(8),
    width: scale(50),
    height: scale(30),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  textInput: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(14),
    marginStart: scale(4),
    paddingTop: 0,
    paddingBottom: isAndroid() ? scale(2) : 0,
    width: scale(30),
    color: '#000000',
  },
  arrowImage: {},
});
