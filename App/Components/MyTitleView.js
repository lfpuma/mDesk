import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {scaleVertical} from '../Utils/scale';
import {textScale} from '../Utils/textUtil';
import ApplicationStyles from '../Utils/ApplicationStyles';

export default class MyTitleView extends Component {
  render() {
    return (
      <View style={styles.titleView}>
        <Text style={styles.titleText}>{this.props.title}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  titleView: {
    height: scaleVertical(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(17),
    color: 'white',
  },
});
