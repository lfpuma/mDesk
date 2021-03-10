import React, {Component} from 'react';
import {connect} from 'react-redux';
import 'react-native-gesture-handler';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Images from './../../Utils/Images';
import {scale, scaleVertical} from '../../Utils/scale';
import ApplicationStyles from '../../Utils/ApplicationStyles';
import {textScale} from '../../Utils/textUtil';
import MyBadge from '../../Components/MyBadge';
import Constants from '../../Config/Constants';
import Colors from '../../Utils/Colors';
import {isAndroid, isIphoneX} from '../../Utils/extension';
import CookieManager from '@react-native-community/cookies';
import {_storeData} from '../../Utils/HelperService';
import * as userActions from '../../Sagas/UserSaga/actions';
import {dialogUtil} from '../../Utils/dialogUtil';

const leftPadding = scale(36);

class DrawerScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showNotificationView: false,
      notifications: Constants.notifications,
      isRefreshing: false,
    };
  }

  componentDidMount() {
    this.props.actions.getProfile();
  }

  onPressNotification = () => {
    // this.setState({showNotificationView: true});
    dialogUtil.showAlert('Alert', 'This feature will be coming soon.');
  };

  onPressCloseNotification = () => {
    this.setState({showNotificationView: false});
  };

  onPressItem(routeName) {
    this.props.navigation.closeDrawer();
    if (routeName === '') {
      return;
    }
    if (routeName === 'MyReservation') {
      this.props.actions.updateReservationListScreenStatus(-1);
    }
    this.props.navigation.navigate(routeName);
  }

  handleLogout = () => {
    console.log('logout');
    CookieManager.clearAll(true).then((success) => {
      _storeData('');
    });
    this.props.navigation.navigate('Login');
  };

  keyExtractor = (item, index) => index.toString();

  renderItem = (icon, name, route) => {
    return (
      <TouchableOpacity
        style={styles.itemView}
        onPress={() => this.onPressItem(route)}>
        <Image source={icon} style={styles.itemIcon} resizeMode={'contain'} />
        <Text style={styles.itemText}>{name}</Text>
      </TouchableOpacity>
    );
  };

  ListEmptyView = () => {
    return (
      <View style={styles.listEmptyView}>
        <Text style={styles.listEmptyText}>No available data</Text>
      </View>
    );
  };

  renderNotificationItem = ({item, index}) => {
    return (
      <View style={{marginBottom: scaleVertical(16)}}>
        <View style={styles.notificationItemView}>
          <Text style={styles.seatAvailableText}>{item.seatAvailable}</Text>
          <Text style={styles.teamText}>{item.team}</Text>
          <Text style={styles.tagsText}>{item.tags}</Text>
        </View>
        <View style={styles.borderView} />
      </View>
    );
  };

  render() {
    return (
      <View style={styles.rootContainer}>
        <View style={styles.topView}>
          {/* <Image
            source={Images.ic_avatar1}
            style={styles.avatar}
            resizeMode={'cover'}
          /> */}
          <Text style={styles.nameText}>{this.props.user.Name ?? ''}</Text>
          <TouchableOpacity
            style={styles.logoutView}
            onPress={this.handleLogout}>
            <Image
              source={Images.ic_logout}
              style={styles.logout}
              resizeMode={'contain'}
            />
          </TouchableOpacity>
        </View>
        {false && (
          <View style={styles.notificationView}>
            <TouchableOpacity
              style={styles.itemView}
              onPress={this.onPressNotification}>
              <View>
                <Image
                  source={Images.ic_ionic_ios_notifications}
                  style={styles.itemIcon}
                  resizeMode={'contain'}
                />
                <MyBadge badgeCount={9} />
              </View>

              <Text
                style={[
                  styles.itemText,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {color: 'black'},
                ]}>
                Notifications
              </Text>
              {this.state.showNotificationView && (
                <TouchableOpacity
                  style={{marginLeft: scale(40), padding: scale(2)}}
                  onPress={this.onPressCloseNotification}>
                  <Image
                    source={Images.ic_close}
                    style={{
                      width: scale(16),
                      height: scale(16),
                    }}
                    resizeMode={'contain'}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {this.state.showNotificationView && (
              <View style={styles.notificationListView}>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={this.state.notifications}
                  style={styles.flatList}
                  renderItem={this.renderNotificationItem}
                  keyExtractor={this.keyExtractor}
                  ListEmptyComponent={this.ListEmptyView}
                  extraData={this.state.notifications}
                />
              </View>
            )}
          </View>
        )}
        <View style={styles.drawerList}>
          <Image
            source={Images.drawer_back}
            style={[
              ApplicationStyles.imageBack,
              // eslint-disable-next-line react-native/no-inline-styles
              {borderTopLeftRadius: 30, borderTopRightRadius: 30},
            ]}
            resizeMode={'cover'}
          />
          <View style={styles.drawerSubView}>
            {this.renderItem(
              Images.ic_awesome_calendar_day_w,
              'My Reservations',
              'MyReservation',
            )}
            {this.renderItem(
              Images.ic_make_reservation,
              'Make Reservation',
              'MakeReservations',
            )}
            {this.renderItem(Images.ic_check_in_w, 'Check-In', 'CheckIn')}
            {/* {this.renderItem(
              Images.ic_qrcode_w,
              'Quick Check-In',
              'QuickCheck',
            )} */}
            {this.renderItem(Images.ic_users_w, 'My Team', 'MyTeam')}
            {this.renderItem(Images.ic_settings_w, 'Settings', 'Settings')}
            <View
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                flex: 1,
                flexDirection: 'column-reverse',
                paddingBottom: scaleVertical(8),
              }}>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.itemText,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {marginLeft: 0},
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.User.user,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    getProfile: () => {
      dispatch(userActions.getProfile());
    },
    updateReservationListScreenStatus: (index) => {
      dispatch(userActions.updateReservationListScreenStatus(index));
    },
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DrawerScreen);

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Drawer List View
  drawerList: {
    flex: 1,
  },
  drawerSubView: {
    flex: 1,
    paddingTop: scaleVertical(20),
    paddingBottom: scaleVertical(20),
    paddingLeft: leftPadding,
  },
  // Item View
  itemView: {
    flexDirection: 'row',
    marginVertical: scaleVertical(14),
  },
  itemIcon: {
    width: scale(18),
    height: scale(18),
    tintColor: 'white',
  },
  itemText: {
    marginLeft: scale(18),
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(13),
    color: 'white',
  },

  // Notification View
  notificationView: {
    marginLeft: leftPadding,
    marginTop: scaleVertical(4),
    marginBottom: scaleVertical(4),
  },
  notificationListView: {
    height: isAndroid() ? scaleVertical(480) : scaleVertical(500),
  },

  // Top View
  topView: {
    marginLeft: scale(24),
    marginTop: scaleVertical(40),
    flexDirection: 'row',
  },
  avatar: {
    width: scale(60),
    height: scale(60),
  },
  nameText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
    marginLeft: scaleVertical(12),
    marginTop: isIphoneX() ? scaleVertical(16) : scaleVertical(6),
    marginBottom: scale(16),
    width: scale(156),
  },
  logoutView: {
    marginTop: isIphoneX() ? scaleVertical(16) : scaleVertical(6),
    marginLeft: scale(10),
  },
  logout: {
    width: scale(20),
    height: scale(20),
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

  // Flat List
  flatList: {
    marginTop: scaleVertical(10),
    marginRight: scale(40),
    flex: 1,
  },

  notificationItemView: {
    height: scaleVertical(64),
  },
  borderView: {
    backgroundColor: Colors.borderColor,
    height: 1,
    marginTop: scaleVertical(4),
  },
  seatAvailableText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(14),
    color: Colors.primaryColor,
  },
  teamText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(12),
    marginTop: scaleVertical(2),
    color: 'black',
  },
  tagsText: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(12),
    marginTop: scaleVertical(2),
    color: Colors.color2,
  },
});
