import React, {Component} from 'react';
import {View, Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MyBackGround from './../../Components/MyBackGround';
import TopLogo from './../../Components/TopLogo';
import Images from './../../Utils/Images';
import Colors from './../../Utils/Colors';
import ApplicationStyles from '../../Utils/ApplicationStyles';
import Value from '../../Utils/Value';
import MyBadge from '../../Components/MyBadge';
import {scale, scaleVertical} from '../../Utils/scale';
import {textScale} from '../../Utils/textUtil';
import MyTitleView from '../../Components/MyTitleView';
import QRCodeScanner from 'react-native-qrcode-scanner';

export default class QuickCheckScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {modalVisible: false};
  }

  onSuccess = (e) => {
    const check = e.data.substring(0, 4);
    console.log('scanned data' + check);
  };

  renderHeader() {
    return (
      <View style={ApplicationStyles.headerView}>
        <TouchableOpacity
          style={ApplicationStyles.headerLeft}
          onPress={() => this.props.navigation.goBack(null)}>
          <Image
            source={Images.ic_back_arrow}
            style={ApplicationStyles.headerRightImage}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
        <TopLogo />
        <TouchableOpacity
          style={ApplicationStyles.headerRight}
          onPress={() => this.props.navigation.openDrawer()}>
          <Image
            source={Images.ic_list}
            style={ApplicationStyles.headerRightImage}
            resizeMode={'contain'}
          />
          <MyBadge badgeCount={9} />
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <MyBackGround />
        {this.renderHeader()}
        <View style={styles.mainView}>
          <View
            style={ApplicationStyles.homeMainView}
            opacity={Value.mainViewOpacity}
          />
          <MyTitleView title={'Quick Check-In'} />
          {this.renderContent()}
        </View>
      </View>
    );
  }

  renderContent = () => (
    <View style={styles.bottomSheetView}>
      <TouchableOpacity style={styles.book}>
        <Text style={styles.bookText}>{'Scan & Check-In'}</Text>
      </TouchableOpacity>
      <View style={styles.bottomSheetMainView}>
        <QRCodeScanner
          reactivate={true}
          showMarker={true}
          ref={(node) => {
            this.scanner = node;
          }}
          onRead={this.onSuccess}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  book: {
    backgroundColor: Colors.primaryColor,
    borderRadius: scaleVertical(20),
    height: scaleVertical(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleVertical(24),
    marginTop: scaleVertical(28),
    marginLeft: scale(36),
    marginRight: scale(36),
  },
  bookText: {
    ...ApplicationStyles.boldFont,
    fontSize: textScale(16),
    color: 'white',
  },

  // Bottom Sheet
  bottomSheetView: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  bottomSheetMainView: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: Value.mainRadius,
  },

  mainView: {
    flex: 1,
  },
});
