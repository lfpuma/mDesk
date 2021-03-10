/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
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
import * as NavigationService from './../../Navigators/NavigationService';
import * as userActions from '../../Sagas/UserSaga/actions';
import {
  convertSTimeToLMonth,
  convertSTimeToLDay,
  isChecked,
  getAvailableReservationList,
} from '../../Utils/extension';
import {apiManager} from '../../Network/APIManager';
import {Overlay} from 'react-native-elements';
import Spinner from 'react-native-spinkit';
import {dialogUtil} from '../../Utils/dialogUtil';

const itemWidth = scale(80);
const itemHeight = scale(60);

class NewCheckinScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    this.handleRefresh();
  }

  UNSAFE_componentWillMount() {}

  handleRefresh = () => {
    this.props.actions.updateReservationListScreenStatus(-1);
    this.props.actions.updateMyReservation();
  };

  handleMore(item, index) {
    this.props.actions.updateReservationListScreenStatus(index);
  }

  handleGuests(reservation) {
    if (reservation.Area == null) {
      dialogUtil.showWarning('You cannot add guests for this reservation.');
      return;
    }
    NavigationService.navigate('Guests', {
      reservation,
    });
  }

  handleMakeNewReservation = () => {
    NavigationService.navigate('MakeReservation');
  };

  handleDeleteReservation(reservation) {
    Alert.alert(
      'Alert',
      'Are you sure?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            apiManager
              .deleteReservation(reservation)
              .then((res) => {
                console.log(res);
                apiManager.checkLoginStatus(res);
                if (res.status === 204) {
                  this.handleRefresh();
                } else {
                  dialogUtil.showWarning(
                    res.data?.Message ?? 'Please try again later',
                  );
                }
              })
              .catch((error) => {
                console.log('checkInReservation error -> ', error);
              });
          },
        },
      ],
      {cancelable: false},
    );
  }

  handlePrepareCheckIn(reservation) {
    if (reservation.Status === 'Checked-in') {
      dialogUtil.showWarning('You already checked in for this reservation');
      return;
    }

    Alert.alert(
      'Are you sure to check in?',
      '',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            this.handleCheckIn(reservation);
          },
        },
      ],
      {cancelable: false},
    );
  }

  handleCheckIn(reservation) {
    if (reservation.Status === 'Checked-in') {
      dialogUtil.showWarning('You already checked in for this reservation');
      return;
    }

    this.setState({isLoading: true});
    setTimeout(() => {
      apiManager
        .checkInReservation(reservation.Id)
        .then((res) => {
          apiManager.checkLoginStatus(res);
          if (res.status === 204) {
            this.setState({isLoading: false});
            this.props.actions.updateMyReservation();
            setTimeout(() => {
              dialogUtil.showSuccess('Checked in successfully!');
            }, 500);
          }
        })
        .catch((error) => {
          this.setState({isLoading: false});
          console.log('checkInReservation error -> ', error);
        });
    }, 1500);
  }

  handleChangeSeat(reservation) {
    if (reservation.Area == null) {
      dialogUtil.showWarning('You cannot change seat for this reservation.');
      return;
    }
    NavigationService.navigate('ChangeSeat', {
      reservation: reservation.Area,
      reservationId: reservation.Id,
      ParkingReserved: reservation.ParkingReserved,
      ParkingSpace: reservation.ParkingSpace ?? '',
      changeSeat: true,
      dates: [reservation.Date],
      lunchIds: reservation.Lunch ?? [],
    });
  }

  keyExtractor = (item, index) => index.toString();

  renderHeader() {
    return (
      <View style={ApplicationStyles.headerView}>
        <TouchableOpacity
          style={ApplicationStyles.headerLeft}
          onPress={() => {
            // if (this.props.selIndex !== -1) {
            //   this.props.actions.updateReservationListScreenStatus(-1);
            //   return;
            // }
            this.props.navigation.goBack(null);
          }}>
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

  ListEmptyView = () => {
    return (
      <View style={styles.listEmptyView}>
        <Text style={styles.listEmptyText}>No available data</Text>
      </View>
    );
  };

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
          <MyTitleView title={'Available for check-in'} />
          {this.renderContent()}
        </View>
        <Overlay
          width="auto"
          height="auto"
          overlayStyle={ApplicationStyles.spinOverLay}
          isVisible={this.state.isLoading}>
          <Spinner type="Circle" color={Colors.primaryColor} />
        </Overlay>
      </View>
    );
  }

  renderContent = () => (
    <View style={styles.bottomSheetView}>
      <FlatList
        onRefresh={this.handleRefresh}
        refreshing={this.props.isRefresh}
        showsVerticalScrollIndicator={false}
        data={getAvailableReservationList(this.props.reservations)}
        style={styles.flatList}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        ListEmptyComponent={this.ListEmptyView}
        extraData={(this.props.reservations, this.props.selIndex)}
      />
    </View>
  );

  renderItem = ({item, index}) => {
    // if (this.props.selIndex === index) {
    //   return (
    //     <View
    //       style={{
    //         paddingHorizontal: scale(35),
    //         backgroundColor: Colors.borderColor,
    //       }}>
    //       <View style={styles.itemSelView}>
    //         <TouchableOpacity
    //           onPress={() => this.handleGuests(item)}
    //           style={[
    //             styles.selItemSubView,
    //             {paddingTop: scale(10), paddingBottom: scale(10)},
    //           ]}>
    //           <Image
    //             source={Images.ic_user_reserve}
    //             style={styles.selItemIcon}
    //             resizeMode={'contain'}
    //           />
    //           <Text style={styles.guestCountText}>
    //             {getGuestsCount(item.Guests)}
    //           </Text>
    //           <Text style={styles.guestsText}>Guests</Text>
    //         </TouchableOpacity>
    //         <TouchableOpacity
    //           style={styles.selItemSubNormalView}
    //           onPress={() => this.handleCheckIn(item)}>
    //           <Image
    //             source={Images.ic_check_in_reserve}
    //             style={styles.selItemIcon}
    //             resizeMode={'contain'}
    //           />
    //           <Text style={styles.selItemNormalText}>Check In</Text>
    //         </TouchableOpacity>
    //         <TouchableOpacity
    //           style={styles.selItemSubNormalView}
    //           onPress={() => this.handleChangeSeat(item)}>
    //           <Image
    //             source={Images.ic_change_seat_reserve}
    //             style={styles.selItemIcon}
    //             resizeMode={'contain'}
    //           />
    //           <Text
    //             style={[styles.selItemNormalText, {paddingBottom: scale(16)}]}>
    //             Change Seat
    //           </Text>
    //         </TouchableOpacity>
    //         <TouchableOpacity
    //           style={styles.selItemSubNormalView}
    //           onPress={() => this.handleDeleteReservation(item)}>
    //           <Image
    //             source={Images.ic_delete_reserve}
    //             style={styles.selItemIcon}
    //             resizeMode={'contain'}
    //           />
    //           <Text style={styles.selItemNormalText}>Delete</Text>
    //         </TouchableOpacity>
    //       </View>
    //     </View>
    //   );
    // }
    return (
      <View style={{marginHorizontal: scale(35), marginTop: scaleVertical(12)}}>
        <TouchableOpacity
          style={styles.itemView}
          onPress={() => this.handlePrepareCheckIn(item)}>
          <View
            style={[
              styles.leftView,
              {
                backgroundColor: isChecked(item)
                  ? '#1CC51C'
                  : Colors.primaryColor,
              },
            ]}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.date2Text}>
                {convertSTimeToLDay(item.Date)}
              </Text>
              <Text
                style={[
                  styles.date1Text,
                  {marginStart: scale(4), marginTop: scale(2)},
                ]}>
                {convertSTimeToLMonth(item.Date)}
              </Text>
            </View>
            <Text style={[styles.checkInText]}>
              {isChecked(item) ? 'Checked in' : 'Check-in'}
            </Text>
          </View>
          <View style={styles.subItemView}>
            <Text style={styles.fullNameText}>
              {item?.Area?.Location?.Name ?? 'Work from Home'}
            </Text>
            <Text style={styles.normalText}>
              {item.Area?.Name ?? ''}
              {item.Seat?.Name ? `, ${item.Seat.Name}` : ''}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.borderView, {marginTop: scale(10)}]} />
      </View>
    );
  };
}

const mapStateToProps = (state) => ({
  isRefresh: state.User.isRefresh,
  reservations: state.User.reservations,
  selIndex: state.User.reservationListSelIndex,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    updateMyReservation: () => {
      dispatch(userActions.updateMyReservation());
    },
    updateReservationListScreenStatus: (index) => {
      dispatch(userActions.updateReservationListScreenStatus(index));
    },
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(NewCheckinScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Flat List
  flatList: {
    marginTop: scaleVertical(24),
    flex: 1,
  },
  itemView: {
    flexDirection: 'row',
    // height: isIphoneX() ? scaleVertical(74) : scaleVertical(88),
    // height: isIphoneX() ? scaleVertical(100) : scaleVertical(110),
  },
  itemSelView: {
    flexDirection: 'row',
    // height: isIphoneX() ? scaleVertical(88) : scaleVertical(100),
    // height: isIphoneX() ? scaleVertical(100) : scaleVertical(110),
  },
  borderView: {
    backgroundColor: Colors.borderColor,
    height: 1,
  },
  leftView: {
    width: itemWidth,
    height: itemHeight,
    borderRadius: 8,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInText: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(12),
    color: 'white',
  },
  date1Text: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(13),
    color: 'white',
  },
  date2Text: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(18),
    color: 'white',
  },
  subItemView: {
    flex: 1,
    marginLeft: scale(16),
    marginTop: scaleVertical(4),
  },
  fullNameText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(16),
  },
  normalText: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(12),
    marginTop: scaleVertical(4),
  },
  moreIconView: {
    width: '100%',
    flexDirection: 'row-reverse',
  },
  moreIcon: {
    width: scale(18),
    height: scale(18),
  },

  // Sel Item
  selItemSubView: {
    width: itemHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryColor,
  },
  selItemSubNormalView: {
    width: itemHeight,
    alignItems: 'center',
    borderRightColor: Colors.borderLightColor,
    borderRightWidth: 1,
    paddingTop: scaleVertical(18),
  },
  selItemIcon: {
    width: scale(22),
    height: scale(22),
  },
  guestCountText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(16),
    marginTop: scaleVertical(6),
    color: 'white',
  },
  guestsText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(11),
    marginTop: scaleVertical(0),
    color: 'white',
  },
  selItemNormalText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(10),
    textAlign: 'center',
    color: 'black',
    marginTop: scaleVertical(8),
    paddingHorizontal: scale(2),
  },

  // List Empty
  listEmptyView: {
    height: scaleVertical(320),
    justifyContent: 'center',
    alignItems: 'center',
  },
  listEmptyText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
    color: 'black',
  },

  // Bottom Sheet
  bottomSheetView: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: Value.mainRadius,
    borderTopRightRadius: Value.mainRadius,
  },
  searchButtonView: {
    backgroundColor: Colors.primaryColor,
    borderRadius: scaleVertical(20),
    width: scaleVertical(40),
    height: scaleVertical(40),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: scaleVertical(30),
    right: scale(40),
  },
  searchButton: {
    width: scaleVertical(20),
    height: scaleVertical(20),
  },

  mainView: {
    flex: 1,
  },
  listView: {
    flexDirection: 'row',
    marginTop: scaleVertical(20),
  },
});
