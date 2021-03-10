/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  FlatList,
} from 'react-native';
import 'react-native-gesture-handler';
import MyBackGround from './../../Components/MyBackGround';
import TopLogo from './../../Components/TopLogo';
import Images from './../../Utils/Images';
import Colors from './../../Utils/Colors';
import ApplicationStyles from '../../Utils/ApplicationStyles';
import Value from '../../Utils/Value';
import MyBadge from '../../Components/MyBadge';
import {scale, scaleVertical} from '../../Utils/scale';
import {textScale} from '../../Utils/textUtil';
import BottomSheet from 'reanimated-bottom-sheet';
import * as NavigationService from './../../Navigators/NavigationService';
import {
  getDateArray,
  getSearchDateString,
  getTodayReservationCount,
  isAndroid,
  isIphoneX,
} from '../../Utils/extension';
import {apiManager} from '../../Network/APIManager';
import {dialogUtil} from '../../Utils/dialogUtil';
import * as userActions from '../../Sagas/UserSaga/actions';
import {_storeData} from '../../Utils/HelperService';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import HomeBadge from '../../Components/HomeBadge';

const bottomSheetHeight1 = isAndroid()
  ? scaleVertical(540)
  : scaleVertical(560);
const bottomSheetHeight2 = scaleVertical(42);
const bottomSheetHeader = scaleVertical(42);
const itemHeight = scaleVertical(80);

class HomeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentBottomSheetPos: 1,
      colleagues: [],
      selColleagueIndex: -1,
      isRefreshing: false,
      isVisibleBackButton: false,

      date: new Date(),
      displayedDate: moment(),
      isVisibleDatePicker: false,
    };

    this.searchString = '';
  }

  componentDidMount() {
    this.props.actions.updateMyReservation();

    // apiManager
    //   .refreshToken()
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((error) => {
    //     console.log('refreshToken error -> ', error);
    //   });
  }

  handleSearch() {
    apiManager
      .getColleague(this.searchString, this.state.date)
      .then((res) => {
        console.log(res);
        apiManager.checkLoginStatus(res);
        if (res.status === 200) {
          this.setState({colleagues: res.data ?? []});
        }
      })
      .catch((error) => {
        console.log('getColleague error -> ', error);
      });
  }

  handleAddTeamMember(member) {
    apiManager
      .addTeamMember(member.Email)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        if (res.status === 204) {
          dialogUtil.showSuccess('Added successfully!');
          this.props.actions.updateMyTeamList();
        } else {
          dialogUtil.showWarning(res.data.Message ?? 'Please try again later');
        }
      })
      .catch((error) => {
        console.log('addTeamMember error -> ', error);
      });
  }

  handleMakeReservation(member) {
    console.log(member);
    if (member.Area == null) {
      dialogUtil.showWarning('This member has no reservation area');
      return;
    }
    const reservations = this.props.reservations;
    let isMatchedDay = false;
    reservations.map((r) => {
      if (
        moment(this.state.date).format('MM-DD-YYYY') ===
        moment(r.Date).format('MM-DD-YYYY')
      ) {
        isMatchedDay = true;
      }
    });

    if (isMatchedDay) {
      dialogUtil.showWarning(
        'You have already made a reservation at another area for the selected date. Please remove that reservation before continuing',
      );
      return;
    }

    NavigationService.navigate('BookReservationWithHome', {
      reservation: member.Area,
      dates: getDateArray(this.state.date, this.state.date),
    });
  }

  onChangeSearchInput(searchString) {
    this.searchString = searchString;
    this.handleSearch();
  }

  openSearchMenu = () => {
    this.sheetRef.snapTo(0);
  };

  _handleTokenRequest(e) {
    console.log(e.url);
    let id_token = e.url.split('id_token=');
    console.log(id_token[1]);

    if (id_token.length === 2) {
      let token = id_token[1].split('&state');
      if (token.length === 2) {
        console.log(token[0]);
        _storeData(token[0]);
      }
    }
  }

  sheetRef = React.createRef();

  keyExtractor = (item, index) => index.toString();

  renderHeader() {
    return (
      <View style={ApplicationStyles.headerView}>
        {this.state.isVisibleBackButton && (
          <TouchableOpacity
            style={ApplicationStyles.headerLeft}
            onPress={() => this.sheetRef.snapTo(1)}>
            <Image
              source={Images.ic_back_arrow}
              style={ApplicationStyles.headerRightImage}
              resizeMode={'contain'}
            />
          </TouchableOpacity>
        )}

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
    const badgeCount = getTodayReservationCount(this.props.reservations);

    return (
      <View style={styles.container}>
        <MyBackGround />
        {/* {this.props.isRefreshToken && (
          <View
            opacity={0}
            style={[
              // eslint-disable-next-line react-native/no-inline-styles
              {
                width: '100%',
                height: '100%',
                position: 'absolute',
              },
            ]}>
            <WebView
              style={[
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                },
              ]}
              source={{uri: apiManager.getRefreshTokenUrl()}}
              onNavigationStateChange={this._handleTokenRequest}
              onShouldStartLoadWithRequest={(e) => {
                return true;
              }}
            />
          </View>
        )} */}

        {this.renderHeader()}
        <View style={styles.mainView}>
          <View
            style={ApplicationStyles.homeMainView}
            opacity={Value.mainViewOpacity}
          />
          <View style={[styles.listView, {marginTop: scaleVertical(50)}]}>
            <TouchableOpacity
              style={styles.subView}
              onPress={() => {
                this.props.actions.updateReservationListScreenStatus(-1);
                this.props.actions.refreshIdToken(false);
                setTimeout(() => {
                  this.props.actions.refreshIdToken(true);
                }, 500);
                NavigationService.navigate('MyReservation');
              }}>
              <View style={styles.subViewIconView}>
                <Image
                  source={Images.ic_awesome_calendar_day}
                  style={styles.subViewIcon}
                  resizeMode={'contain'}
                />
              </View>
              <Text style={styles.subViewText}>My Reservations</Text>
            </TouchableOpacity>
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
          {/* <View style={styles.listView}>
            <TouchableOpacity
              style={styles.subView}
              onPress={() => NavigationService.navigate('CheckIn')}>
              <View style={styles.subViewIconView}>
                <Image
                  source={Images.ic_awesome_calendar_check}
                  style={styles.subViewIcon}
                  resizeMode={'contain'}
                />
              </View>
              <Text style={styles.subViewText}>Check-In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.subView}
              onPress={() => NavigationService.navigate('QuickCheck')}>
              <View style={styles.subViewIconView}>
                <Image
                  source={Images.ic_awesome_qrcode}
                  style={styles.subViewIcon}
                  resizeMode={'contain'}
                />
              </View>
              <Text style={styles.subViewText}>Quick Check-In</Text>
            </TouchableOpacity>
          </View> */}
          <View style={styles.listView}>
            <TouchableOpacity
              style={styles.subView}
              onPress={() => NavigationService.navigate('CheckIn')}>
              <View style={styles.subViewIconView}>
                <Image
                  source={Images.ic_awesome_calendar_check}
                  style={styles.subViewIcon}
                  resizeMode={'contain'}
                />
              </View>
              <Text style={styles.subViewText}>Check-In</Text>
              <HomeBadge badgeCount={badgeCount} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.subView}
              onPress={() => NavigationService.navigate('MyTeam')}>
              <View style={styles.subViewIconView}>
                <Image
                  source={Images.ic_metro_users}
                  style={styles.subViewIcon}
                  resizeMode={'contain'}
                />
              </View>
              <Text style={styles.subViewText}>My Team</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.subView}
              onPress={() => NavigationService.navigate('Settings')}>
              <View style={styles.subViewIconView}>
                <Image
                  source={Images.ic_ionic_md_settings}
                  style={styles.subViewIcon}
                  resizeMode={'contain'}
                />
              </View>
              <Text style={styles.subViewText}>Settings</Text>
            </TouchableOpacity> */}
          </View>

          {/* <View style={styles.listView}>
            <TouchableOpacity
              style={styles.subView}
              onPress={() => NavigationService.navigate('MyLunch')}>
              <View style={styles.subViewIconView}>
                <Image
                  source={Images.ic_dining}
                  style={styles.subViewIcon}
                  resizeMode={'contain'}
                />
              </View>
              <Text style={styles.subViewText}>Lunch</Text>
            </TouchableOpacity>
            <View style={[styles.subView, {opacity: 0}]} />
          </View> */}

          <BottomSheet
            ref={(sr) => {
              this.sheetRef = sr;
            }}
            initialSnap={this.state.currentBottomSheetPos}
            onCloseEnd={() => {
              this.setState({
                currentBottomSheetPos: 1,
                isVisibleBackButton: false,
              });
              Keyboard.dismiss();
            }}
            enabledHeaderGestureInteraction={true}
            enabledContentGestureInteraction={false}
            onCloseStart={() => this.setState({currentBottomSheetPos: 0})}
            onOpenStart={() => this.setState({currentBottomSheetPos: 0})}
            onOpenEnd={() =>
              this.setState({
                currentBottomSheetPos: 0,
                isVisibleBackButton: true,
              })
            }
            snapPoints={[bottomSheetHeight1, bottomSheetHeight2]}
            renderHeader={this.renderSheetHeader}
            renderContent={this.renderContent}
          />
        </View>
        <DateTimePickerModal
          isVisible={this.state.isVisibleDatePicker}
          display="spinner"
          mode="date"
          date={this.state.date}
          minimumDate={new Date()}
          onConfirm={(date) => {
            this.setState({date, isVisibleDatePicker: false});
            this.state.date = date;
            this.handleSearch();
          }}
          onCancel={() => this.setState({isVisibleDatePicker: false})}
        />
      </View>
    );
  }

  renderSheetHeader = () => (
    <View
      style={[
        styles.bottomSheetHeaderContent,
        this.state.currentBottomSheetPos === 0
          ? {
              backgroundColor: 'white',
            }
          : {
              backgroundColor: Colors.primaryColor,
            },
      ]}>
      <View style={styles.bottomSheetHeaderView}>
        <View style={styles.bottomSheetSearchView}>
          <TouchableOpacity
            style={styles.searchButtonView}
            onPress={this.openSearchMenu}>
            <Image
              source={Images.ic_awesome_search_white}
              style={styles.searchButton}
              resizeMode={'contain'}
            />
          </TouchableOpacity>
          <TextInput
            placeholder={'Find Colleague'}
            placeholderTextColor={'black'}
            style={styles.searchInput}
            enablesReturnKeyAutomatically
            returnKeyType="search"
            onChangeText={(searchString) => {
              this.onChangeSearchInput(searchString);
            }}
            blurOnSubmit={true}
            onSubmitEditing={(event) => {
              this.handleSearch(event.nativeEvent.text);
            }}
            onFocus={this.openSearchMenu}
          />
        </View>
      </View>
    </View>
  );

  renderContent = () => (
    <View style={styles.bottomSheetView}>
      <View
        style={[
          styles.bottomContainView,
          this.state.currentBottomSheetPos === 0
            ? {
                backgroundColor: 'white',
              }
            : {
                backgroundColor: Colors.primaryColor,
              },
        ]}>
        <TouchableOpacity
          onPress={() => this.setState({isVisibleDatePicker: true})}>
          <View style={styles.rangerView}>
            <Text style={styles.rangerText}>
              {getSearchDateString(this.state.date)}
            </Text>
            <Image
              source={Images.ic_calendar}
              style={styles.calendarIcon}
              resizeMode={'contain'}
            />
          </View>
        </TouchableOpacity>

        <FlatList
          showsVerticalScrollIndicator={false}
          data={this.state.colleagues}
          style={styles.flatList}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          ListEmptyComponent={this.ListEmptyView}
          extraData={[this.state.colleagues, this.state.selColleagueIndex]}
        />
        {/* <TouchableOpacity style={styles.viewMore}>
          <Text style={styles.viewMoreText}>View more</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  renderItem = ({item, index}) => {
    if (index === this.state.selColleagueIndex) {
      return (
        <TouchableOpacity
          onPress={() => this.setState({selColleagueIndex: false})}>
          <View style={styles.selItemView}>
            <TouchableOpacity
              onPress={() => this.handleAddTeamMember(item)}
              style={{
                backgroundColor: Colors.color5,
                height: '100%',
                width: scale(66),
                paddingHorizontal: scale(10),
                paddingTop: scaleVertical(24),
                alignItems: 'center',
              }}>
              <Image
                source={Images.ic_add}
                style={styles.selItemIcon}
                resizeMode={'contain'}
              />
              <Text style={styles.selText}>{'Team\nmember'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.handleMakeReservation(item)}
              style={{
                backgroundColor: Colors.color5,
                height: '100%',
                width: scale(66),
                paddingHorizontal: scale(4),
                paddingTop: scaleVertical(24),
                marginRight: scale(1),
                alignItems: 'center',
              }}>
              <Image
                source={Images.ic_make_reservation}
                style={styles.selItemIcon}
                resizeMode={'contain'}
              />
              <Text style={styles.selText}>{'Make\nreservation'}</Text>
            </TouchableOpacity>
            <View
              style={[
                styles.subItemView,

                {
                  marginLeft: scale(28),
                  marginTop: scaleVertical(16),
                  flex: 1,
                  height: itemHeight,
                },
              ]}>
              <Text numberOfLines={1} style={styles.fullNameText}>
                {item.Area?.Name ?? 'Location unknown'}
              </Text>
              <Text numberOfLines={1} style={styles.normalText}>
                {item.Name ?? ''}
              </Text>
              <Text numberOfLines={1} style={styles.normalText}>
                {item.Email ?? ''}
              </Text>
            </View>
          </View>
          <View style={styles.borderView} />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={{marginHorizontal: scale(36), marginTop: scaleVertical(16)}}
        onPress={() => {
          this.setState({selColleagueIndex: index});
          console.log(item);
        }}>
        <View style={styles.itemView}>
          <Image
            source={
              item.IsHome
                ? Images.ic_metro_home
                : item.Area == null
                ? Images.ic_none
                : Images.ic_building
            }
            style={styles.itemIcon}
            resizeMode={'contain'}
          />
          <View style={styles.subItemView}>
            <Text numberOfLines={1} style={styles.fullNameText}>
              {item.Area?.Name ?? 'Location unknown'}
            </Text>
            <Text numberOfLines={1} style={styles.normalText}>
              {item.Name ?? ''}
            </Text>
            <Text numberOfLines={1} style={styles.normalText}>
              {item.Email ?? ''}
            </Text>
          </View>
        </View>
        <View style={styles.borderView} />
      </TouchableOpacity>
    );
  };
}

const mapStateToProps = (state) => ({
  isRefreshToken: state.User.isRefreshToken,
  reservations: state.User.reservations,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    refreshIdToken: (isRefresh) => {
      dispatch(userActions.refreshIdToken(isRefresh));
    },
    updateReservationListScreenStatus: (index) => {
      dispatch(userActions.updateReservationListScreenStatus(index));
    },
    updateMyTeamList: () => {
      dispatch(userActions.updateMyTeamList());
    },
    updateMyReservation: () => {
      dispatch(userActions.updateMyReservation());
    },
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Flat List
  flatList: {
    marginTop: scaleVertical(0),
    flex: 1,
  },
  itemView: {
    flexDirection: 'row',
    height: itemHeight,
  },
  selItemView: {
    flexDirection: 'row-reverse',
    height: itemHeight + scaleVertical(16),
  },
  borderView: {
    backgroundColor: Colors.borderColor,
    height: 1,
  },
  itemIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.primaryColor,
  },
  selItemIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.primaryColor,
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
  selText: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(10),
    textAlign: 'center',
    marginTop: scaleVertical(10),
  },

  // view more button
  viewMore: {
    backgroundColor: Colors.primaryColor,
    borderRadius: scaleVertical(20),
    height: scaleVertical(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaleVertical(16),
    marginBottom: scaleVertical(24),
    marginLeft: scale(36),
    marginRight: scale(36),
  },
  viewMoreText: {
    ...ApplicationStyles.boldFont,
    fontSize: textScale(16),
    color: 'white',
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
    height: bottomSheetHeight1 - bottomSheetHeader,
  },
  bottomSheetHeaderView: {
    position: 'absolute',
    height: scaleVertical(40),
    width: '100%',
    top: -scaleVertical(20),
  },
  bottomSheetSearchView: {
    marginHorizontal: scale(38),
    flex: 1,
    backgroundColor: 'white',
    borderRadius: scaleVertical(20),
    borderWidth: 1,
    borderColor: Colors.borderColor,
    flexDirection: 'row-reverse',
  },
  searchInput: {
    ...ApplicationStyles.regularFont,
    flex: 1,
    fontSize: textScale(14),
    marginHorizontal: scale(20),
    paddingBottom: isAndroid() ? scaleVertical(6) : scaleVertical(0),
  },
  searchButtonView: {
    backgroundColor: Colors.primaryColor,
    borderRadius: scaleVertical(20),
    width: scaleVertical(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: scaleVertical(20),
    height: scaleVertical(20),
  },

  // Bottom Sheet Contain
  bottomContainView: {
    flex: 1,
  },
  // Bottom Sheet Header
  bottomSheetHeaderContent: {
    height: bottomSheetHeader,
    borderTopLeftRadius: Value.mainRadius,
    borderTopRightRadius: Value.mainRadius,
  },

  mainView: {
    flex: 1,
    alignItems: 'center',
  },
  listView: {
    flexDirection: 'row',
    marginTop: scaleVertical(20),
  },
  subView: {
    marginHorizontal: scale(10),
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
    paddingHorizontal: scale(22),
    color: 'black',
    textAlign: 'center',
  },

  // Search Date
  rangerView: {
    height: isIphoneX() ? scaleVertical(40) : scaleVertical(48),
    borderRadius: isIphoneX() ? scaleVertical(20) : scaleVertical(24),
    backgroundColor: 'white',
    marginHorizontal: scale(35),
    paddingHorizontal: scale(20),
    paddingTop: isIphoneX() ? scaleVertical(12) : scaleVertical(14),
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'black',
  },
  rangerText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
  },
  calendarIcon: {
    width: scale(16),
    height: scale(16),
    position: 'absolute',
    right: scale(18),
    top: isAndroid()
      ? scaleVertical(16)
      : isIphoneX()
      ? scaleVertical(12)
      : scaleVertical(15),
  },
});
