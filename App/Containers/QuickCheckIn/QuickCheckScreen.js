/* eslint-disable react-native/no-inline-styles */
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
import {apiManager} from '../../Network/APIManager';
import {Dimensions} from 'react-native';
import moment from 'moment';
import {connect} from 'react-redux';
import * as userActions from '../../Sagas/UserSaga/actions';
import {dialogUtil} from '../../Utils/dialogUtil';
import * as NavigationService from './../../Navigators/NavigationService';
import CheckBox from '@react-native-community/checkbox';
import {isAndroid} from '../../Utils/extension';
import CustomRadioBox from '../../Components/CustonRadioBox';

class QuickCheckScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      seatId: null,
      seatInfo: null,

      parkingAvailable: false,
      parking: false,

      availableLunchList: [],
      lunchIds: [],
    };

    this.canScan = true;
  }

  async onBook() {
    if (!this.canScan || this.props.seatId == null) {
      return;
    }

    // const lunchItems = this.state.seatInfo.LunchItems ?? [];
    // console.log(lunchItems.map((v) => v.id));
    // console.log(this.state.parking);

    if (this.state.seatInfo.ExistingReservation != null) {
      await apiManager.deleteReservation(
        this.state.seatInfo.ExistingReservation,
      );
    }

    apiManager
      .quickCheckIn({
        SeatId: this.props.seatId,
        ParkingReserved: this.state.parking,
        LunchIds: this.state.lunchIds,
      })
      .then((res) => {
        apiManager.checkLoginStatus(res);
        console.log(res);
        if (res.status === 204) {
          this.props.actions.updateMyReservation();
          dialogUtil.showNotice('Success!', '', () => {
            setTimeout(() => {
              NavigationService.navigate('MyReservation');
            }, 250);
          });
        }
      })
      .catch((error) => {
        console.log('getLocations error -> ', error);
      });
  }

  onSuccess = (e) => {
    // const check = e.data.substring(0, 4);
    // console.log('scanned data: ' + e.data);
    if (!this.canScan) {
      return;
    }
    if (this.props.seatId == null && e.data != null) {
      let qrData = e.data;
      if (typeof qrData === 'string') {
        var seatId = e.data.split('/').pop();
        seatId = Number(seatId);
        // this.props.seatId = seatId;
        this.canScan = false;
        this.getCheckinInfo(seatId);
      }
    }
  };

  onClickParking() {
    if (!this.state.parkingAvailable) {
      return;
    }
    this.setState({parking: !this.state.parking});
  }

  onClickLunch(lunchAvailable, id) {
    if (!lunchAvailable || id === 0) {
      return;
    }
    this.setState({
      lunchIds: [id],
    });
  }

  getCheckinInfo(seatId) {
    apiManager
      .getCheckInInfo(seatId)
      .then((res) => {
        console.log(res.data);
        apiManager.checkLoginStatus(res);
        this.setState({
          seatInfo: res.data,
          parking: false,
          lunchIds: [],
          parkingAvailable: res.data.ParkingAvailable ?? false,
          availableLunchList: res.data.LunchItems ?? [],
        });
        setTimeout(() => {
          this.props.actions.updateQrCodeSeatId(seatId);
        }, 250);
        setTimeout(() => {
          this.canScan = true;
        }, 500);
      })
      .catch((error) => {
        this.canScan = true;
        console.log('getLocations error -> ', error);
      });
  }

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
    const bookDiabled =
      (this.state.seatInfo?.SeatAvailable ?? false) === false ||
      this.props.seatId == null;
    return (
      <View style={styles.container}>
        <MyBackGround />
        {this.renderHeader()}
        <View style={styles.mainView}>
          <View
            style={ApplicationStyles.homeMainView}
            opacity={Value.mainViewOpacity}
          />
          <MyTitleView title={'Scan & Book'} />
          {/* {this.renderContent()} */}
          <View style={styles.bottomSheetView}>
            <TouchableOpacity
              disabled={bookDiabled}
              onPress={() => this.onBook()}
              style={[
                styles.book,
                {
                  opacity: bookDiabled ? 0.5 : 1.0,
                },
              ]}>
              <Text style={styles.bookText}>{'Book'}</Text>
            </TouchableOpacity>
            {this.renderQrInfo()}
            <View style={styles.bottomSheetMainView}>
              <View style={styles.qrView}>
                <QRCodeScanner
                  reactivate={true}
                  showMarker={true}
                  ref={(node) => {
                    this.scanner = node;
                  }}
                  containerStyle={styles.qrScannerContainer}
                  onRead={this.onSuccess}
                />
                <Image
                  source={Images.ic_qr_border}
                  style={styles.qrBorder}
                  resizeMode={'contain'}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  renderContent = () => (
    <View style={styles.bottomSheetView}>
      <TouchableOpacity
        onPress={() => this.onBook()}
        style={[
          styles.book,
          {
            opacity:
              // this.props.seatId == null ||
              (this.state.seatInfo?.SeatAvailable ?? false) === false
                ? 0.5
                : 1.0,
          },
        ]}
        activeOpacity={0.5}>
        <Text style={styles.bookText}>{'Book'}</Text>
      </TouchableOpacity>
      {this.renderQrInfo()}
      <View style={styles.bottomSheetMainView}>
        <View style={styles.qrView}>
          <QRCodeScanner
            reactivate={true}
            showMarker={true}
            ref={(node) => {
              this.scanner = node;
            }}
            containerStyle={styles.qrScannerContainer}
            onRead={this.onSuccess}
          />
          <Image
            source={Images.ic_qr_border}
            style={styles.qrBorder}
            resizeMode={'contain'}
          />
        </View>
      </View>
    </View>
  );

  renderQrInfo = () => (
    <View style={styles.qrInfoView}>
      {this.props.seatId == null ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={styles.emptyText}>Scan QR Code</Text>
        </View>
      ) : (this.state.seatInfo?.SeatAvailable ?? false) === true ? (
        <View style={{flex: 1}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={styles.infoLeftView}>
              <Image
                source={Images.ic_chair}
                style={styles.chair}
                resizeMode={'contain'}
              />
              <Text style={styles.seatNum}>{`Seat ${this.props.seatId}`}</Text>
            </View>
            <View style={styles.infoRightView}>
              <Text style={[styles.emptyText, {fontSize: textScale(14)}]}>
                {this.state.seatInfo?.Area?.Name ?? ''}
              </Text>
              <Text style={[styles.emptyText, {fontSize: textScale(12)}]}>
                {moment().format('DD.MM.yyyy')}
              </Text>
              <Text
                numberOfLines={2}
                style={[
                  styles.emptyText,
                  {fontSize: textScale(12), marginTop: scale(8), flex: 1},
                ]}>
                {this.state.seatInfo?.Area?.Location?.Note ?? ''}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkBoxes}
            onPress={() => this.onClickParking()}
            activeOpacity={1.0}>
            <CheckBox
              boxType={'square'}
              disabled={!this.state.parkingAvailable || isAndroid()}
              tintColors={
                this.state.parkingAvailable
                  ? {true: Colors.primaryColor, false: Colors.primaryColor}
                  : {true: Colors.color1, false: Colors.color1}
              }
              style={styles.checkbox}
              value={this.state.parking}
            />
            <Text
              style={
                this.state.parkingAvailable
                  ? styles.checkBoxText
                  : styles.disableCheckBoxText
              }>
              {this.state.seatInfo?.ParkingSpaceName ?? 'Parking'}
            </Text>
          </TouchableOpacity>
          {this.renderLunch()}
        </View>
      ) : (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text
            style={
              styles.emptyText
            }>{`Seat ${this.props.seatId} is not available today\nPlease select another seat`}</Text>
        </View>
      )}
    </View>
  );

  renderLunch() {
    const {availableLunchList} = this.state;
    if (availableLunchList.length === 0) {
      return <Text style={styles.lunchNAText}>Lunch Not Available</Text>;
    }
    return (
      <View>
        {availableLunchList.map((v, i) => (
          <TouchableOpacity
            key={i}
            style={styles.checkBoxes}
            onPress={() => this.onClickLunch(v.IsAvailable ?? false, v.id ?? 0)}
            activeOpacity={1.0}>
            <CustomRadioBox
              disabled={true}
              isChecked={this.state.lunchIds.indexOf(v.id) !== -1}
            />
            <Text
              style={
                v.IsAvailable ?? false
                  ? styles.checkBoxText
                  : styles.disableCheckBoxText
              }>
              {v.Name ?? ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  seatId: state.User.qrCodeSeatId,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    updateQrCodeSeatId: (seatId) => {
      dispatch(userActions.updateQrCodeSeatId(seatId));
    },
    updateMyReservation: () => {
      dispatch(userActions.updateMyReservation());
    },
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(QuickCheckScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // parking and lunch
  checkBoxes: {
    flexDirection: 'row',
    marginTop: scaleVertical(10),
    marginHorizontal: scale(0),
    alignSelf: 'baseline',
  },
  checkBoxText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
    marginLeft: scale(16),
    color: 'black',
  },
  disableCheckBoxText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
    marginLeft: scale(16),
    color: Colors.color1,
  },
  checkbox: {
    width: scale(16),
    height: scale(16),
    marginTop: scaleVertical(2),
  },
  lunchNAText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
    marginTop: scale(16),
    marginBottom: scale(8),
    marginLeft: scale(34),
    color: 'red',
  },

  // Qr info view
  infoRightView: {
    flex: 1,
    marginLeft: scale(16),
    opacity: 0.8,
  },
  infoLeftView: {
    height: scaleVertical(80),
    width: scaleVertical(60),
    backgroundColor: Colors.primaryColor,
    borderRadius: scaleVertical(6),
    opacity: 0.8,
    alignItems: 'center',
  },
  chair: {
    tintColor: 'white',
    width: scaleVertical(28),
    height: scaleVertical(28),
    marginTop: scaleVertical(8),
    marginBottom: scaleVertical(4),
  },
  seatNum: {
    ...ApplicationStyles.boldFont,
    fontSize: textScale(12),
    color: 'white',
  },
  emptyText: {
    ...ApplicationStyles.boldFont,
    fontSize: textScale(16),
    color: 'black',
  },

  // bottom button
  book: {
    backgroundColor: 'white',
    borderRadius: scaleVertical(20),
    height: scaleVertical(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleVertical(32),
    marginTop: scaleVertical(28),
    marginLeft: scale(36),
    marginRight: scale(36),
  },
  bookText: {
    ...ApplicationStyles.boldFont,
    fontSize: textScale(16),
    color: Colors.primaryColor,
  },

  // Bottom Sheet
  bottomSheetView: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  bottomSheetMainView: {
    flex: 1,
    borderRadius: Value.mainRadius,
  },

  // Scan QR Code
  qrInfoView: {
    backgroundColor: 'white',
    borderRadius: scaleVertical(10),
    height: scaleVertical(230),
    marginBottom: scaleVertical(0),
    marginTop: scaleVertical(28),
    marginLeft: scale(36),
    marginRight: scale(36),
    padding: scaleVertical(10),
  },

  // QR
  qrView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBorder: {
    width: Dimensions.get('window').height * 0.3,
    height: Dimensions.get('window').height * 0.3,
    position: 'absolute',
    margin: 'auto',
    tintColor: 'white',
  },
  qrScannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainView: {
    flex: 1,
  },
});
