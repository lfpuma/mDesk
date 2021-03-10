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
import {isIphoneX} from '../../Utils/extension';
import {dialogUtil} from '../../Utils/dialogUtil';
import {apiManager} from '../../Network/APIManager';
import * as userActions from '../../Sagas/UserSaga/actions';
import * as NavigationService from './../..//Navigators/NavigationService';

const itemHeight = scale(90);

class GuestsScreen extends Component {
  constructor(props) {
    super(props);

    this.reservation = props.navigation.getParam('reservation');

    this.props.actions.updateCurrentGuestList(this.reservation.Id);

    this.state = {
      isRefreshing: false,
      selIndex: -1,
    };
  }

  handleCreateGuest = () => {
    NavigationService.navigate('AddGuest', {
      reservation: this.reservation,
    });
  };

  handleCheckIn(guest, index) {
    if (guest.Status === 'Checked-in') {
      dialogUtil.showWarning('You already checked in for this guest');
      return;
    }

    apiManager
      .checkInGuest(guest.Id)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        if (res.status === 204) {
          this.props.actions.updateMyReservationWithGuests(this.reservation.Id);
          setTimeout(() => {
            dialogUtil.showSuccess('Checked in successfully!');
          }, 500);
        }
      })
      .catch((error) => {
        dialogUtil.showWarning('Please try again later');
        console.log('checkInReservation error -> ', error);
      });
  }

  handleDeleteGuest(guest) {
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
              .deleteGuest(guest.Id)
              .then((res) => {
                apiManager.checkLoginStatus(res);
                if (res.status === 204) {
                  this.props.actions.updateMyReservationWithGuests(
                    this.reservation.Id,
                  );
                  this.setState({
                    selIndex: -1,
                  });
                }
              })
              .catch((error) => {
                dialogUtil.showWarning('Please try again later');
                console.log('checkInReservation error -> ', error);
              });
          },
        },
      ],
      {cancelable: false},
    );
  }

  handleChangeSeat(guest) {
    NavigationService.navigate('AddGuest', {
      reservation: this.props.navigation.getParam('reservation'),
      userName: guest.Username,
      email: guest.Email,
      XCoord: guest.XCoord,
      YCoord: guest.YCoord,
      ParkingReserved: guest.ParkingReserved,
      ParkingSpace: guest.ParkingSpace ?? '',
      lunchIds: guest.Lunch ?? [],
      changeSeat: true,
      guestId: guest.Id,
    });
  }

  keyExtractor = (item, index) => index.toString();

  renderHeader() {
    return (
      <View style={ApplicationStyles.headerView}>
        <TouchableOpacity
          style={ApplicationStyles.headerLeft}
          onPress={() => {
            if (this.state.selIndex !== -1) {
              this.setState({selIndex: -1});
              return;
            }
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
          <MyTitleView title={'Guests'} />
          {this.renderContent()}
        </View>
        <TouchableOpacity
          style={styles.searchButtonView}
          onPress={this.handleCreateGuest}>
          <Image
            source={Images.ic_add}
            style={styles.searchButton}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
      </View>
    );
  }

  renderContent = () => (
    <View style={styles.bottomSheetView}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={this.props.guestList}
        style={styles.flatList}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        ListEmptyComponent={this.ListEmptyView}
        extraData={(this.props.guestList, this.state.selIndex)}
      />
    </View>
  );

  renderItem = ({item, index}) => {
    if (this.state.selIndex === index) {
      return (
        <View
          style={{
            paddingHorizontal: scale(35),
            backgroundColor: Colors.borderColor,
          }}>
          <View style={styles.itemSelView}>
            <TouchableOpacity
              style={styles.selItemSubNormalView}
              onPress={() => this.handleCheckIn(item, index)}>
              <Image
                source={Images.ic_check_in_reserve}
                style={styles.selItemIcon}
                resizeMode={'contain'}
              />
              <Text style={styles.selItemNormalText}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selItemSubNormalView}
              onPress={() => this.handleChangeSeat(item)}>
              <Image
                source={Images.ic_change_seat_reserve}
                style={styles.selItemIcon}
                resizeMode={'contain'}
              />
              <Text style={styles.selItemNormalText}>{'Change\nSeat'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selItemSubNormalView}
              onPress={() => this.handleDeleteGuest(item)}>
              <Image
                source={Images.ic_delete_reserve}
                style={styles.selItemIcon}
                resizeMode={'contain'}
              />
              <Text style={styles.selItemNormalText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={{marginHorizontal: scale(35), marginTop: scaleVertical(12)}}
        onPress={() => this.setState({selIndex: index})}>
        <View style={styles.itemView}>
          <Image
            source={Images.ic_user_reserve}
            style={styles.itemIcon}
            resizeMode={'contain'}
          />
          <View style={styles.subItemView}>
            <Text style={styles.fullNameText}>{item.Username ?? ''}</Text>
            <Text style={styles.normalText}>{item.Email ?? ''}</Text>
          </View>
        </View>
        <View style={styles.borderView} />
      </TouchableOpacity>
    );
  };
}

const mapStateToProps = (state) => ({
  reservations: state.User.reservations,
  guestList: state.User.currentGuestList,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    updateMyReservation: () => {
      dispatch(userActions.updateMyReservation());
    },
    updateCurrentGuestList: (reservationId) => {
      dispatch(userActions.updateCurrentGuestList(reservationId));
    },
    updateMyReservationWithGuests: (reservationId) => {
      dispatch(userActions.updateMyReservationWithGuests(reservationId));
    },
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GuestsScreen);

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
    height: scaleVertical(60),
  },
  borderView: {
    backgroundColor: Colors.borderColor,
    height: 1,
  },
  subItemView: {
    marginLeft: scale(16),
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

  // Sel Item
  itemSelView: {
    flexDirection: 'row',
    height: isIphoneX() ? scaleVertical(88) : scaleVertical(100),
  },
  selItemSubNormalView: {
    width: itemHeight,
    alignItems: 'center',
    borderRightColor: Colors.borderLightColor,
    borderLeftColor: Colors.borderLightColor,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    paddingTop: scaleVertical(18),
  },
  selItemIcon: {
    width: scale(22),
    height: scale(22),
  },
  selItemNormalText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(10),
    textAlign: 'center',
    color: 'black',
    marginTop: scaleVertical(8),
    paddingHorizontal: scale(2),
  },

  itemIcon: {
    width: scale(22),
    height: scale(22),
    tintColor: Colors.primaryColor,
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
