import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MyBackGround from './../../Components/MyBackGround';
import TopLogo from './../../Components/TopLogo';
import Images from './../../Utils/Images';
import ApplicationStyles from '../../Utils/ApplicationStyles';
import Value from '../../Utils/Value';
import MyBadge from '../../Components/MyBadge';
import {scale, scaleVertical} from '../../Utils/scale';
import {textScale} from '../../Utils/textUtil';
import MyTitleView from '../../Components/MyTitleView';
import * as NavigationService from './../../Navigators/NavigationService';
import Colors from '../../Utils/Colors';
import {
  getTodayHomeReservation,
  getTodayReservation,
  isChecked,
} from '../../Utils/extension';
import {apiManager} from '../../Network/APIManager';
import {dialogUtil} from '../../Utils/dialogUtil';
import * as userActions from '../../Sagas/UserSaga/actions';
import {
  _storeTodayCheckStatus,
  getTodayCheckStatus,
} from '../../Utils/HelperService';

class CheckInScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {modalVisible: false, homeStatus: false};
  }

  componentDidMount() {
    getTodayCheckStatus().then((json) => {
      console.log(json);
      const homeStatus = JSON.parse(json);
      if (homeStatus == null) {
        this.setState({homeStatus: false});
      } else {
        this.setState({homeStatus});
      }
    });
  }

  handleCheckIn(reservation) {
    apiManager
      .checkInReservation(reservation.Id)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        if (res.status === 204) {
          this.props.actions.updateMyReservation();
          _storeTodayCheckStatus(false).then(() => {
            this.componentDidMount();
          });
          setTimeout(() => {
            dialogUtil.showSuccess('Checked in successfully!');
          }, 500);
        }
      })
      .catch((error) => {
        console.log('checkInReservation error -> ', error);
      });
  }

  handleCheckInHome() {
    apiManager
      .checkInAtHome()
      .then((res) => {
        console.log(res);
        apiManager.checkLoginStatus(res);
        if (res.status === 204) {
          this.props.actions.updateMyReservation();
          _storeTodayCheckStatus(true).then(() => {
            this.componentDidMount();
          });
          dialogUtil.showSuccess('Checked in successfully!');
        }
      })
      .catch((error) => {
        dialogUtil.showWarning('Please try again later');
        console.log('checkInReservation error -> ', error);
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
    const todayReservation = getTodayReservation(this.props.reservations);
    const todayHomeReservation = getTodayHomeReservation(
      this.props.reservations,
    );
    const homeStatus = this.state.homeStatus;

    return (
      <View style={styles.container}>
        <MyBackGround />
        {this.renderHeader()}
        <View style={styles.mainView}>
          <View
            style={ApplicationStyles.homeMainView}
            opacity={Value.mainViewOpacity}
          />
          <MyTitleView title={'Check-In'} />
          <View style={styles.listView}>
            {todayHomeReservation == null || !homeStatus ? (
              <TouchableOpacity
                style={styles.subView}
                onPress={() => this.handleCheckInHome()}>
                <View style={styles.subViewIconView}>
                  <Image
                    source={Images.ic_home}
                    style={styles.subViewIcon}
                    resizeMode={'contain'}
                  />
                </View>
                <Text style={styles.subViewText}>Check-In Home</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                disabled={true}
                style={[
                  styles.subView,
                  {
                    backgroundColor: Colors.color2,
                  },
                ]}>
                <View style={styles.subViewIconView}>
                  <Image
                    source={Images.ic_home}
                    style={styles.subViewIcon}
                    resizeMode={'contain'}
                  />
                </View>
                <Text style={styles.subViewText}>Checked-In Home</Text>
              </TouchableOpacity>
            )}
            {todayReservation == null ? (
              <TouchableOpacity
                disabled={true}
                style={[
                  styles.subView,
                  {
                    backgroundColor: Colors.color2,
                  },
                ]}
                onPress={() => NavigationService.navigate('CheckInOffice')}>
                <View style={styles.subViewIconView}>
                  <Image
                    source={Images.ic_building}
                    style={styles.subViewIcon}
                    resizeMode={'contain'}
                  />
                </View>
                <Text style={styles.subViewSmallText}>
                  No reservation today
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                disabled={isChecked(todayReservation)}
                style={[
                  styles.subView,
                  isChecked(todayReservation)
                    ? {
                        backgroundColor: Colors.color2,
                      }
                    : null,
                ]}
                onPress={() => this.handleCheckIn(todayReservation)}>
                <View style={styles.subViewIconView}>
                  <Image
                    source={Images.ic_building}
                    style={styles.subViewIcon}
                    resizeMode={'contain'}
                  />
                </View>
                {isChecked(todayReservation) ? (
                  <Text style={styles.subViewSmallText}>
                    {`${
                      todayReservation.Area?.Location?.Name ?? ''
                    }\nChecked-in`}
                  </Text>
                ) : (
                  <Text style={styles.subViewSmallText}>
                    {`${
                      todayReservation.Area?.Location?.Name ?? ''
                    }\nNot checked-in`}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.subView}
              onPress={() => NavigationService.navigate('MakeReservations')}>
              <View style={styles.subViewIconView}>
                <Image
                  source={Images.ic_make_reservation}
                  style={styles.subViewIcon}
                  resizeMode={'contain'}
                />
              </View>
              <Text style={styles.subViewText}>Make Reservation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  reservations: state.User.reservations,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    updateMyReservation: () => {
      dispatch(userActions.updateMyReservation());
    },
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CheckInScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  mainView: {
    flex: 1,
  },

  listView: {
    flex: 1,
    alignItems: 'center',
  },

  subView: {
    marginBottom: scaleVertical(20),
    width: scale(130),
    height: scale(130),
    borderRadius: Value.subViewRadius,
    backgroundColor: 'white',
  },
  subViewIconView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: scaleVertical(60),
    marginTop: scaleVertical(6),
  },
  subViewIcon: {
    width: scale(34),
    height: scale(34),
  },
  subViewText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(13),
    paddingHorizontal: scale(24),
    color: 'black',
    textAlign: 'center',
  },
  subViewSmallText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(10),
    paddingHorizontal: scale(24),
    color: 'black',
    textAlign: 'center',
  },
});
