import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {scale} from '../Utils/scale';
import {textScale} from '../Utils/textUtil';

export default class MyBadge extends Component {
  render() {
    return (
      // <View style={styles.container}>
      //   <Text style={styles.badgeCount}>{this.props.badgeCount}</Text>
      // </View>
      null
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    backgroundColor: '#FFA200',
    right: -scale(4),
    top: -scale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCount: {
    color: 'black',
    fontSize: textScale(8),
  },
});
