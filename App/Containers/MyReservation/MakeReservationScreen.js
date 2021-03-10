import React, {Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import MyBackGround from '../../Components/MyBackGround';
import TopLogo from '../../Components/TopLogo';
import Images from '../../Utils/Images';
import Colors from '../../Utils/Colors';
import ApplicationStyles from '../../Utils/ApplicationStyles';
import Value from '../../Utils/Value';
import MyBadge from '../../Components/MyBadge';
import {scale, scaleVertical} from '../../Utils/scale';
import {textScale} from '../../Utils/textUtil';
import MyTitleView from '../../Components/MyTitleView';
import * as NavigationService from '../../Navigators/NavigationService';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import DateRangePicker from 'react-native-daterange-picker';
import {
  getStartEndDateString,
  getDeviceWidth,
  isIphoneX,
  isAndroid,
  getDateArray,
} from '../../Utils/extension';
import {apiManager} from '../../Network/APIManager';
import * as userActions from '../../Sagas/UserSaga/actions';
import {connect} from 'react-redux';
import {dialogUtil} from '../../Utils/dialogUtil';
import {Alert} from 'react-native';

const itemHeight = scale(68);

class MakeReservationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      locationData: [],
      reservationList: [],
      isRefreshing: false,
      showFilterView: false,
      filterValue: {},
      startDate: new Date(),
      endDate: new Date(),
      displayedDate: moment(),
      filterItems: [
        {
          value: 'Monitors',
          isSelected: false,
        },
        {
          value: 'Projector',
          isSelected: false,
        },
        {
          value: 'WIFI',
          isSelected: false,
        },
        {
          value: 'Quiet Zone',
          isSelected: false,
        },
        {
          value: 'Parking',
          isSelected: false,
        },
        {
          value: 'Lunch',
          isSelected: false,
        },
      ],
    };
  }

  componentDidMount() {
    apiManager
      .getFacilities()
      .then((res) => {
        apiManager.checkLoginStatus(res);
        console.log(res);
        if (res.status === 200) {
          let filterItems = [];
          res.data.map((v) => {
            filterItems.push({value: v.Name, isSelected: false});
          });
          this.setState({filterItems});
        }
      })
      .catch((error) => {
        console.log('getFacilities error -> ', error);
      });
    apiManager
      .getLocations()
      .then((res) => {
        apiManager.checkLoginStatus(res);
        let locationData = [];
        res.data.map((v) => {
          locationData.push({...v, label: v.Name, value: v.Id});
        });
        this.setState({locationData});
      })
      .catch((error) => {
        console.log('getLocations error -> ', error);
      });
  }

  setDates = (dates) => {
    console.log(dates);
    this.setState({
      ...dates,
    });
    if (dates.startDate != null) {
      this.state.startDate = dates.startDate;
    }
    if (dates.endDate != null) {
      this.state.endDate = dates.endDate;
    }
    this.handleRefresh();
  };

  changeLocationItem(item) {
    this.setState({
      filterValue: item,
    });
    this.state.filterValue = item;
    this.handleRefresh();
  }

  isIncludeFacilities(facilities) {
    const selectedF = this.state.filterItems.filter((v) => v.isSelected);
    console.log(facilities);
    console.log(selectedF);
    if (selectedF.length === 0) {
      return true;
    }
    if (facilities == null) {
      return false;
    }
    for (let i = 0; i < selectedF.length; i++) {
      const isInclude =
        facilities.filter((f) => f.Name === selectedF[i].value).length !== 0;
      console.log(isInclude);
      if (!isInclude) {
        return false;
      }
    }
    return true;
  }

  handleRefresh() {
    if (this.state.filterValue.value == null) {
      return;
    }
    apiManager
      .getAreas(
        this.state.filterValue.value,
        this.state.startDate,
        this.state.endDate,
      )
      .then((res) => {
        apiManager.checkLoginStatus(res);
        console.log(res);
        if (res.status === 200) {
          const reservationList = res.data.filter((v) =>
            this.isIncludeFacilities(v.Facilities),
          );
          this.setState({reservationList});
        }
      })
      .catch((error) => {
        console.log('getAreas error -> ', error);
      });
  }

  handleItemClick(item) {
    const dates = getDateArray(this.state.startDate, this.state.endDate);
    const reservations = this.props.reservations;
    var isMatchedDay = false;
    dates.map((v) => {
      reservations.map((r) => {
        if (
          moment(v).format('MM-DD-YYYY') === moment(r.Date).format('MM-DD-YYYY')
        ) {
          isMatchedDay = true;
        }
      });
    });

    if (isMatchedDay) {
      dialogUtil.showWarning(
        'You have already made a reservation at another area for the selected date. Please remove that reservation before continuing',
      );
      return;
    }

    NavigationService.navigate('BookReservation', {
      reservation: item,
      dates,
    });
  }

  handleCheckInHome() {
    const dates = getDateArray(this.state.startDate, this.state.endDate);
    const reservations = this.props.reservations;
    var isMatchedDay = false;
    dates.map((v) => {
      reservations.map((r) => {
        if (
          moment(v).format('MM-DD-YYYY') === moment(r.Date).format('MM-DD-YYYY')
        ) {
          isMatchedDay = true;
        }
      });
    });

    Alert.alert(
      '',
      isMatchedDay
        ? 'You have existing reservations on those dates, do you want to make the new reservation? The existing reservations will be deleted automatically.'
        : 'Are you sure you want to add a reservation for work from',
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
              .checkInAtHome(dates)
              .then((res) => {
                console.log(res);
                apiManager.checkLoginStatus(res);
                if (res.status === 204) {
                  this.props.actions.updateMyReservation();
                  dialogUtil.showSuccess('Added successfully!');
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

  onToggleFilterBox(index) {
    var filterItems = this.state.filterItems;
    filterItems[index].isSelected = !filterItems[index].isSelected;
    this.setState({filterItems});
    this.state.filterItems = filterItems;
    this.handleRefresh();
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
        {this.renderHeader()}
        <View
          style={[
            ApplicationStyles.homeMainView,
            {marginTop: scaleVertical(70)},
          ]}
          opacity={Value.mainViewOpacity}
        />
        <MyTitleView title={'Make Reservation'} />
        <View style={styles.filterView}>
          <DropDownPicker
            placeholder={'Choose location'}
            items={this.state.locationData}
            defaultValue={this.state.filterValue.value ?? ''}
            containerStyle={styles.dropdownContainer}
            style={styles.dropDownStyle}
            itemStyle={styles.dropDownItemStyle}
            dropDownStyle={styles.dropDownBodyStyle}
            labelStyle={styles.dropDownLabelStyle}
            arrowSize={isIphoneX() ? scale(24) : scale(20)}
            arrowColor={Colors.color2}
            arrowStyle={styles.dropDownArrowStyle}
            onChangeItem={(item) => this.changeLocationItem(item)}
          />
        </View>
        <DateRangePicker
          onChange={this.setDates}
          endDate={this.state.endDate}
          startDate={this.state.startDate}
          minDate={new Date()}
          displayedDate={this.state.displayedDate}
          range>
          <View style={styles.rangerView}>
            {this.state.startDate == null ? (
              <Text style={styles.rangerPlaceHolderText}>Start - End Date</Text>
            ) : (
              <Text style={styles.rangerText}>
                {getStartEndDateString(
                  this.state.startDate,
                  this.state.endDate,
                )}
              </Text>
            )}
            <Image
              source={Images.ic_calendar}
              style={styles.calendarIcon}
              resizeMode={'contain'}
            />
          </View>
        </DateRangePicker>
        <View style={styles.mainView}>{this.renderContent()}</View>
      </View>
    );
  }

  renderContent = () => (
    <View style={styles.bottomSheetView}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={this.state.reservationList}
        style={styles.flatList}
        ListHeaderComponent={this.renderHeaderItem}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        // ListEmptyComponent={this.ListEmptyView}
        extraData={this.state.reservationList}
      />
      {this.state.showFilterView && this.renderFilterView()}
      <TouchableOpacity
        style={[
          styles.searchButtonView,
          this.state.showFilterView
            ? // eslint-disable-next-line react-native/no-inline-styles
              {backgroundColor: 'white'}
            : {backgroundColor: Colors.primaryColor},
        ]}
        onPress={() =>
          this.setState({showFilterView: !this.state.showFilterView})
        }>
        <Image
          source={Images.ic_filter}
          style={[
            styles.searchButton,
            !this.state.showFilterView
              ? // eslint-disable-next-line react-native/no-inline-styles
                {tintColor: 'white'}
              : {tintColor: Colors.primaryColor},
          ]}
          resizeMode={'contain'}
        />
      </TouchableOpacity>
    </View>
  );

  renderHeaderItem = () => {
    return (
      <TouchableOpacity
        style={{marginHorizontal: scale(35), marginTop: scaleVertical(12)}}
        onPress={() => this.handleCheckInHome()}>
        <View style={styles.itemView}>
          <View style={[styles.leftView]}>
            <Image
              source={Images.ic_home}
              style={{
                width: scale(34),
                height: scale(34),
                tintColor: 'white',
              }}
              resizeMode={'contain'}
            />
          </View>
          <View style={styles.subItemView}>
            <Text style={styles.fullNameText}>Work from home</Text>
          </View>
        </View>
        <View style={styles.borderView} />
      </TouchableOpacity>
    );
  };

  renderItem = ({item, index}) => {
    const notAvailable = item.Reservations === item.Capacity;
    return (
      <TouchableOpacity
        disabled={notAvailable}
        style={{marginHorizontal: scale(35), marginTop: scaleVertical(12)}}
        onPress={() => this.handleItemClick(item)}>
        <View style={styles.itemView}>
          <View
            style={[
              styles.leftView,
              notAvailable
                ? {
                    backgroundColor: Colors.color3,
                  }
                : {backgroundColor: Colors.primaryColor},
            ]}>
            <Text style={styles.date1Text}>Seats</Text>
            <Text
              style={
                styles.date2Text
              }>{`${item.Reservations}/${item.Capacity}`}</Text>
          </View>
          <View style={styles.subItemView}>
            <Text style={styles.fullNameText}>{item.Name ?? ''}</Text>
            {notAvailable && (
              // eslint-disable-next-line react-native/no-inline-styles
              <View style={{flexDirection: 'row', marginTop: scaleVertical(6)}}>
                <CheckBox
                  boxType={'square'}
                  tintColors={{
                    true: Colors.primaryColor,
                    false: Colors.primaryColor,
                  }}
                  style={styles.checkbox}
                />
                <Text style={styles.checkBoxText}>
                  Notify if seat available
                </Text>
              </View>
            )}
            {!notAvailable && (
              <Text style={styles.normalText}>{item.Note ?? ''}</Text>
            )}
          </View>
        </View>
        <View style={styles.borderView} />
      </TouchableOpacity>
    );
  };

  renderFilterView = () => {
    return (
      <View style={styles.filterListView}>
        {this.state.filterItems.map((item, index) =>
          this.renderFilterItemView(item, index),
        )}
      </View>
    );
  };

  renderFilterItemView = (item, index) => {
    return (
      <TouchableOpacity
        style={[
          styles.checkBoxes,
          item.isSelected
            ? {
                backgroundColor: Colors.color4,
              }
            : {
                backgroundColor: Colors.primaryColor,
              },
        ]}
        key={index}
        onPress={() => this.onToggleFilterBox(index)}
        activeOpacity={1.0}>
        <CheckBox
          boxType={'square'}
          disabled={isAndroid()}
          value={item.isSelected}
          tintColors={{true: 'white', false: 'white'}}
          style={styles.filterItemCheckbox}
          // onValueChange={() => this.onToggleFilterBox(index)}
        />
        <Text style={styles.filterItemCheckBoxText}>{item.value}</Text>
      </TouchableOpacity>
    );
  };
}

const mapStateToProps = (state) => ({
  isRefresh: state.User.isRefresh,
  reservations: state.User.reservations,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MakeReservationScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Filter List View
  filterListView: {
    position: 'absolute',
    backgroundColor: Colors.primaryColor,
    borderRadius: Value.mainRadius,
    overflow: 'hidden',
  },
  checkBoxes: {
    flexDirection: 'row',
    paddingVertical: scaleVertical(12),
    paddingHorizontal: scale(35),
    marginBottom: 2,
    width: getDeviceWidth(),
  },
  filterItemCheckBoxText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(16),
    marginLeft: scale(18),
    color: 'white',
  },
  filterItemCheckbox: {
    width: scale(20),
    height: scale(20),
    backgroundColor: isAndroid() ? 'transparent' : 'white',
  },

  // DateTime Ranger
  rangerView: {
    height: isIphoneX() ? scaleVertical(40) : scaleVertical(48),
    borderRadius: isIphoneX() ? scaleVertical(20) : scaleVertical(24),
    backgroundColor: 'white',
    marginHorizontal: scale(35),
    paddingHorizontal: scale(20),
    paddingTop: isIphoneX() ? scaleVertical(12) : scaleVertical(14),
    marginTop: scaleVertical(6),
    marginBottom: scaleVertical(30),
  },
  rangerText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
  },
  rangerPlaceHolderText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
    color: Colors.color1,
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

  // DropDown
  dropdownContainer: {
    height: isIphoneX() ? scaleVertical(40) : scaleVertical(48),
  },
  dropDownStyle: {
    backgroundColor: '#fafafa',
    borderTopLeftRadius: isIphoneX() ? scaleVertical(20) : scaleVertical(24),
    borderTopRightRadius: isIphoneX() ? scaleVertical(20) : scaleVertical(24),
    borderBottomLeftRadius: isIphoneX() ? scaleVertical(20) : scaleVertical(24),
    borderBottomRightRadius: isIphoneX()
      ? scaleVertical(20)
      : scaleVertical(24),
  },
  dropDownItemStyle: {
    justifyContent: 'flex-start',
  },
  dropDownBodyStyle: {
    backgroundColor: '#fafafa',
    marginLeft: scale(22),
    width: scale(240),
  },
  dropDownArrowStyle: {
    marginRight: scale(6),
  },
  dropDownLabelStyle: {
    fontSize: textScale(14),
    ...ApplicationStyles.mediumFont,
    marginTop: scaleVertical(2),
    paddingLeft: scale(6),
  },

  // Flat List
  flatList: {
    marginTop: scaleVertical(24),
    flex: 1,
  },
  itemView: {
    flexDirection: 'row',
    marginHorizontal: 0,
    height: isIphoneX() ? scaleVertical(74) : scaleVertical(88),
  },
  itemSelView: {
    flexDirection: 'row',
    height: scaleVertical(88),
  },
  borderView: {
    backgroundColor: Colors.borderColor,
    height: 1,
  },
  leftView: {
    width: itemHeight,
    height: itemHeight,
    borderRadius: 8,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  date1Text: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(13),
    color: 'white',
  },
  date2Text: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(16),
    color: 'white',
    marginTop: scaleVertical(4),
  },
  subItemView: {
    marginLeft: scale(16),
    flex: 1,
    marginTop: scaleVertical(4),
  },
  fullNameText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(16),
  },
  normalText: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(11),
    marginTop: scaleVertical(4),
  },
  checkBoxText: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(13),
    marginLeft: isAndroid() ? scale(10) : scale(6),
  },
  checkbox: {
    width: scale(16),
    height: scale(16),
    marginTop: scaleVertical(1),
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
    top: -scaleVertical(20),
    right: scale(40),
  },
  searchButton: {
    width: scaleVertical(16),
    height: scaleVertical(16),
  },

  mainView: {
    flex: 1,
  },
  listView: {
    flexDirection: 'row',
    marginTop: scaleVertical(20),
  },

  // Filter View
  filterView: isAndroid()
    ? {
        height: isIphoneX() ? scaleVertical(50) : scaleVertical(58),
        marginHorizontal: scale(35),
      }
    : {
        height: isIphoneX() ? scaleVertical(50) : scaleVertical(58),
        marginHorizontal: scale(35),
        zIndex: 20,
      },
});
