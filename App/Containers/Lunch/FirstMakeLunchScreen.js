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
} from 'react-native';
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
import * as userActions from '../../Sagas/UserSaga/actions';
import {
  convertSTimeToLMonth,
  convertSTimeToLDay,
  isIphoneX,
} from '../../Utils/extension';
import {Overlay} from 'react-native-elements';
import Spinner from 'react-native-spinkit';
import {dialogUtil} from '../../Utils/dialogUtil';
import {getWeekNumber, getDateRangeOfWeek} from '../../Utils/HelperService';
import DropDownPicker from 'react-native-dropdown-picker';
import {apiManager} from '../../Network/APIManager';

const itemHeight = scale(64);

class FirstMakeLunchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      selItemIndexList: [],
      currentDate: new Date(),
      lunches: [1, 2, 3, 4, 5],

      // Location Selector
      filterValue: {},
      locationData: [],
    };
  }

  componentDidMount() {
    this.handleRefresh();

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

  handleRefresh = () => {};

  onPressLeftDate = () => {
    // Prev Week
    var currentDate = new Date(
      this.state.currentDate.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    console.log(currentDate);
    this.setState({currentDate});
  };

  onPressRightDate = () => {
    // Next Week
    var currentDate = new Date(
      this.state.currentDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    console.log(currentDate);
    this.setState({currentDate});
  };

  handleNext = () => {
    if (this.state.selItemIndexList.length === 0) {
      dialogUtil.showWarning('You should add one lunch at least');
      return;
    }
    NavigationService.navigate('SecondMakeLunch');
  };

  onPressItemAdd(item, index) {
    const isAdded = item.isAdded ?? false;
    item.isAdded = !isAdded;
    const selItemIndexList = this.state.selItemIndexList;
    if (selItemIndexList.includes(index)) {
      const sIndex = selItemIndexList.indexOf(index);
      if (sIndex !== -1) {
        selItemIndexList.splice(index, 1);
      }
    } else {
      selItemIndexList.push(index);
    }
    this.setState({selItemIndexList});
  }

  changeLocationItem(item) {
    this.setState({
      filterValue: item,
    });
    this.state.filterValue = item;
    this.handleRefresh();
  }

  keyExtractor = (item, index) => index.toString();

  renderHeader() {
    return (
      <View style={ApplicationStyles.headerView}>
        <TouchableOpacity
          style={ApplicationStyles.headerLeft}
          onPress={() => {
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
          <MyTitleView title={'Choose Lunch'} />
          {this.renderContent()}
        </View>
        <TouchableOpacity
          style={styles.addButtonView}
          onPress={this.handleNext}>
          <Text style={styles.addButtonText}>Next {'>'}</Text>
        </TouchableOpacity>
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

  renderContent = () => {
    const currentDate = this.state.currentDate;
    const currentYear = getWeekNumber(currentDate)[0];
    const currentWeekIndex = getWeekNumber(currentDate)[1];
    const days = getDateRangeOfWeek(currentWeekIndex, currentYear);
    const firstDay = days[0].format('MMM.DD.yyyy').split('.');
    const lastDay = days[6].format('MMM.DD.yyyy').split('.');
    var final = '';
    if (firstDay[2] !== lastDay[2]) {
      final = `${firstDay.join('.')}-${lastDay.join('.')}`;
    } else if (firstDay[0] !== lastDay[0]) {
      final = `${firstDay[0]}.${firstDay[1]}-${lastDay[0]}.${lastDay[1]} ${firstDay[2]}`;
    } else {
      final = `${firstDay[0]}.${firstDay[1]}-${lastDay[1]} ${firstDay[2]}`;
    }
    final = `${final} - Week ${currentWeekIndex}`;
    return (
      <View style={styles.bottomSheetView}>
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
        <View style={styles.limitContainer}>
          <TouchableOpacity onPress={this.onPressLeftDate}>
            <Image source={Images.ic_left_arrow} />
          </TouchableOpacity>
          <Text style={styles.weekText}>{final}</Text>
          <TouchableOpacity onPress={this.onPressRightDate}>
            <Image source={Images.ic_right_arrow} />
          </TouchableOpacity>
        </View>
        <FlatList
          onRefresh={this.handleRefresh}
          refreshing={this.props.isRefresh}
          showsVerticalScrollIndicator={false}
          data={this.state.lunches}
          style={styles.flatList}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          ListEmptyComponent={this.ListEmptyView}
          extraData={[this.state.lunches, this.state.selItemIndexList]}
          ListFooterComponent={() => <View style={{marginBottom: scale(60)}} />}
        />
      </View>
    );
  };

  renderItem = ({item, index}) => {
    const isAdded = this.state.selItemIndexList.includes(index);
    return (
      <View
        style={{marginHorizontal: scale(24), marginBottom: scaleVertical(16)}}>
        <View style={styles.itemView}>
          <View
            style={[
              styles.leftView,
              {
                backgroundColor: isAdded ? Colors.color6 : Colors.primaryColor,
              },
            ]}>
            <Text style={styles.date1Text}>
              {/* {convertSTimeToLMonth(item.Date)} */}
              Nov
            </Text>
            <Text style={styles.date2Text}>
              {/* {convertSTimeToLDay(item.Date)} */}
              03
            </Text>
          </View>
          <View>
            <View style={styles.subItemView}>
              <Text
                style={[
                  styles.fullNameText,
                  {color: '#999999', marginEnd: scale(8)},
                ]}>
                Lunch
              </Text>
              <Text style={styles.fullNameText}>11:15 - 11:45</Text>
            </View>
            <View style={styles.subItemView}>
              <Text
                style={[
                  styles.fullNameText,
                  {color: '#999999', marginEnd: scale(8)},
                ]}>
                Lunch
              </Text>
              <Text style={styles.fullNameText}>11:45 - 12:15</Text>
            </View>
            <View style={styles.subItemView}>
              <Text
                style={[
                  styles.fullNameText,
                  {color: '#999999', marginEnd: scale(8)},
                ]}>
                Lunch
              </Text>
              <Text style={styles.fullNameText}>12:15 - 12:45</Text>
            </View>
          </View>
          <View
            style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
            <TouchableOpacity
              style={[
                styles.removeButtonView,
                {
                  backgroundColor: isAdded
                    ? Colors.color6
                    : Colors.primaryColor,
                },
              ]}
              onPress={() => this.onPressItemAdd(item, index)}>
              <Text style={styles.removeButtonText}>
                {isAdded ? 'Remove' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.borderView} />
      </View>
    );
  };
}

const mapStateToProps = (state) => ({
  isRefresh: state.User.isRefresh,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {},
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FirstMakeLunchScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // borderView
  borderView: {
    backgroundColor: Colors.borderColor,
    height: 1,
    marginTop: scale(10),
  },

  // Flat List
  flatList: {
    marginTop: scaleVertical(24),
    flex: 1,
  },
  itemView: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: scale(8),
    paddingStart: scale(8),
  },
  leftView: {
    width: itemHeight,
    height: itemHeight,
    borderRadius: 8,
    backgroundColor: Colors.color6,
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
    fontSize: textScale(18),
    color: 'white',
  },
  subItemView: {
    marginLeft: scale(16),
    marginBottom: scale(10),
    flexDirection: 'row',
  },
  fullNameText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(14),
  },
  normalText: {
    ...ApplicationStyles.regularFont,
    fontStyle: 'italic',
    fontSize: textScale(10),
    color: '#999999',
    marginTop: scaleVertical(4),
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
  addButtonView: {
    backgroundColor: Colors.primaryColor,
    borderRadius: scale(20),
    height: scale(40),
    width: scale(108),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: scaleVertical(30),
    right: scale(32),
  },
  addButtonText: {
    ...ApplicationStyles.semiBoldFont,
    color: 'white',
    fontSize: textScale(16),
    marginHorizontal: scale(16),
  },
  removeButtonView: {
    backgroundColor: Colors.primaryColor,
    borderRadius: scale(20),
    height: scale(40),
    width: scale(68),
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    ...ApplicationStyles.semiBoldFont,
    color: 'white',
    fontSize: textScale(12),
  },

  mainView: {
    flex: 1,
  },
  limitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scale(24),
    marginHorizontal: scale(32),
  },
  weekText: {
    ...ApplicationStyles.semiBoldFont,
    marginHorizontal: scale(16),
    textAlign: 'center',
    fontSize: textScale(16),
  },

  // DropDown
  dropdownContainer: {
    height: isIphoneX() ? scaleVertical(40) : scaleVertical(48),
    marginHorizontal: scale(35),
    marginTop: scale(12),
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
});
