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
import * as NavigationService from './../../Navigators/NavigationService';
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
import * as userActions from '../../Sagas/UserSaga/actions';
import {apiManager} from '../../Network/APIManager';
import {
  getDateArray,
  getSearchDateString,
  getSTime,
  isAndroid,
  isIphoneX,
} from '../../Utils/extension';
import moment from 'moment';
import {_storeTimeForTeam} from '../../Utils/HelperService';
import {dialogUtil} from '../../Utils/dialogUtil';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const itemHeight = scaleVertical(80);
const manualTop = scaleVertical(120);

class MyTeamScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selIndex: -1,
      date: new Date(),
      displayedDate: moment(),
    };
  }

  componentDidMount() {
    this.handleRefresh();
  }

  handleRefresh = () => {
    this.setState({selIndex: -1});
    _storeTimeForTeam(getSTime(this.state.date));
    this.props.actions.updateMyTeamList();
  };

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

    NavigationService.navigate('BookReservationWithTeam', {
      reservation: member.Area,
      dates: getDateArray(this.state.date, this.state.date),
    });
  }

  handleDeleteTeamMember(member) {
    console.log(member);
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
              .deleteTeamMember(member.Id)
              .then((res) => {
                apiManager.checkLoginStatus(res);
                this.handleRefresh();
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

  keyExtractor = (item, index) => index.toString();

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
        <View
          style={[
            ApplicationStyles.homeMainView,
            {marginTop: scaleVertical(70)},
          ]}
          opacity={Value.mainViewOpacity}
        />
        <View style={styles.bottomSheetView} />
        <View style={styles.teamView}>
          <FlatList
            onRefresh={this.handleRefresh}
            showsVerticalScrollIndicator={false}
            data={this.props.myTeamList}
            refreshing={this.props.isRefresh}
            style={styles.flatList}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            ListEmptyComponent={this.ListEmptyView}
            extraData={[this.props.myTeamList, this.state.selIndex]}
          />
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
          <MyTitleView title={'My Team'} />
          {this.renderHeader()}
        </View>
        <DateTimePickerModal
          isVisible={this.state.isVisibleDatePicker}
          mode="date"
          display="spinner"
          date={this.state.date}
          minimumDate={new Date()}
          onConfirm={(date) => {
            this.setState({date, isVisibleDatePicker: false});
            this.state.date = date;
            this.handleRefresh();
          }}
          onCancel={() => this.setState({isVisibleDatePicker: false})}
        />
      </View>
    );
  }

  renderItem = ({item, index}) => {
    if (index === this.state.selIndex) {
      return (
        <TouchableOpacity onPress={() => this.setState({selIndex: false})}>
          <View style={styles.selItemView}>
            <TouchableOpacity
              onPress={() => this.handleDeleteTeamMember(item)}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                backgroundColor: Colors.color5,
                height: '100%',
                width: scale(66),
                paddingHorizontal: scale(10),
                paddingTop: scaleVertical(24),
                alignItems: 'center',
              }}>
              <Image
                source={Images.ic_delete_reserve}
                style={styles.selItemIcon}
                resizeMode={'contain'}
              />
              <Text style={styles.selText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.handleMakeReservation(item)}
              // eslint-disable-next-line react-native/no-inline-styles
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
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  marginLeft: scale(28),
                  marginTop: scaleVertical(16),
                  flex: 1,
                  height: itemHeight,
                },
              ]}>
              <Text numberOfLines={1} style={styles.fullNameText}>
                {item.Name ?? ''}
              </Text>
              <Text numberOfLines={1} style={styles.normalText}>
                {item.Email ?? ''}
              </Text>
              <Text numberOfLines={1} style={styles.normalText}>
                {item.Area?.Name ?? 'Location unknown'}
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
        onPress={() => this.setState({selIndex: index})}>
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
              {item.Name ?? ''}
            </Text>
            <Text numberOfLines={1} style={styles.normalText}>
              {item.Email ?? ''}
            </Text>
            <Text numberOfLines={1} style={styles.normalText}>
              {item.Area?.Name ?? 'Location unknown'}
            </Text>
          </View>
        </View>
        <View style={styles.borderView} />
      </TouchableOpacity>
    );
  };
}

const mapStateToProps = (state) => ({
  isRefresh: state.User.isRefresh,
  myTeamList: state.User.myTeamList,
  reservations: state.User.reservations,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    updateMyTeamList: () => {
      dispatch(userActions.updateMyTeamList());
    },
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MyTeamScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Flat List
  flatList: {
    marginTop: scaleVertical(20),
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
  teamView: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderTopLeftRadius: Value.mainRadius,
    borderTopRightRadius: Value.mainRadius,
    flexDirection: 'column-reverse',
  },
  bottomSheetView: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    top: manualTop,
    position: 'absolute',
    borderTopLeftRadius: Value.mainRadius,
    borderTopRightRadius: Value.mainRadius,
    flexDirection: 'column-reverse',
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
    marginTop: scaleVertical(4),
  },

  // Search Date
  rangerView: {
    height: isIphoneX() ? scaleVertical(40) : scaleVertical(48),
    borderRadius: isIphoneX() ? scaleVertical(20) : scaleVertical(24),
    backgroundColor: 'white',
    marginHorizontal: scale(35),
    paddingHorizontal: scale(20),
    paddingTop: isIphoneX() ? scaleVertical(12) : scaleVertical(14),
    marginTop: scaleVertical(20),
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
