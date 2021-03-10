import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {scale} from '../Utils/scale';
import {textScale} from '../Utils/textUtil';

export default class HomeBadge extends Component {
  render() {
    const badgeCount = this.props.badgeCount;
    if (badgeCount == null || badgeCount === 0) {
      return null;
    }
    return (
      <View style={styles.container}>
        <Text style={styles.badgeCount}>{badgeCount}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: '#1CC51C',
    right: scale(12),
    top: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCount: {
    color: 'white',
    fontSize: textScale(13),
    fontWeight: 'bold',
  },
});
