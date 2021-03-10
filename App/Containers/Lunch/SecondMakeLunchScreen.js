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
  isAndroid,
} from '../../Utils/extension';
import {Overlay} from 'react-native-elements';
import Spinner from 'react-native-spinkit';
import CustomRadioBox from '../../Components/CustonRadioBox';
import CheckBox from '@react-native-community/checkbox';
import AddGuestTextInput from '../../Components/AddGuestTextInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const itemHeight = scale(64);

class SecondMakeLunchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      lunches: [
        {
          availableLunches: [
            {
              isChecked: true,
            },
            {
              isChecked: false,
            },
            {
              isChecked: false,
            },
          ],
          guests: 0,
        },
        {
          availableLunches: [
            {
              isChecked: false,
            },
            {
              isChecked: true,
            },
            {
              isChecked: false,
            },
          ],
          guests: 0,
        },
      ],
    };
  }

  componentDidMount() {}

  onPressChecked(i, j) {
    const lunches = this.state.lunches;
    lunches[i].availableLunches.forEach((v, vi) => {
      v.isChecked = false;
      if (vi === j) {
        v.isChecked = true;
      }
    });
    this.setState({lunches});
  }

  onGuestsChanged(text, index) {
    const lunches = this.state.lunches;
    if (text === -1) {
      lunches[index].guests = lunches[index].guests - 1;
    } else if (text === 1) {
      lunches[index].guests = lunches[index].guests + 1;
    } else {
      lunches[index].guests = Number(text);
    }
    if (lunches[index].guests < 0) {
      lunches[index].guests = 0;
    }
    this.setState({lunches});
  }

  handleNext = () => {
    NavigationService.navigate('FinalMakeLunch');
  };

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

  renderContent = () => (
    <View style={styles.bottomSheetView}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        extraScrollHeight={scale(80)}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={this.state.lunches}
          style={styles.flatList}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          ListEmptyComponent={this.ListEmptyView}
          ListFooterComponent={() => <View style={{marginBottom: scale(60)}} />}
        />
      </KeyboardAwareScrollView>
    </View>
  );

  renderItem = ({item, index}) => {
    return (
      <View
        style={{marginHorizontal: scale(24), marginBottom: scaleVertical(16)}}>
        <View style={styles.itemView}>
          <View style={styles.leftView}>
            <Text style={styles.date1Text}>
              {/* {convertSTimeToLMonth(item.Date)} */}
              Nov
            </Text>
            <Text style={styles.date2Text}>
              {/* {convertSTimeToLDay(item.Date)} */}
              03
            </Text>
          </View>
          <View style={{flex: 1, marginStart: scale(16), marginEnd: scale(12)}}>
            <Text style={styles.availableText}>Available lunches</Text>
            {item.availableLunches.map((v, i) => (
              <View style={styles.subItemView}>
                <Text
                  style={[
                    styles.fullNameText,
                    {color: '#999999', marginEnd: scale(8)},
                  ]}>
                  Lunch
                </Text>
                <Text style={styles.fullNameText}>11:15 - 11:45</Text>
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                  <CustomRadioBox
                    isChecked={v.isChecked}
                    onPress={() => this.onPressChecked(index, i)}
                  />
                </View>
              </View>
            ))}
            <View style={styles.itemSubView}>
              <Text style={styles.fullNameText}>Add guests</Text>
              <AddGuestTextInput
                returnKeyType="done"
                keyboardType={'decimal-pad'}
                value={item.guests.toString()}
                onChangeText={(text) => this.onGuestsChanged(text, index)}
                onPressUp={() => this.onGuestsChanged(1, index)}
                onPressDown={() => this.onGuestsChanged(-1, index)}
              />
            </View>
            <View style={styles.itemSubView}>
              <Text style={styles.normalText}>Check-In at office</Text>
              <CheckBox
                boxType={'square'}
                disabled={true}
                tintColor={'#999999'}
                onCheckColor={'#707070'}
                onTintColor={'#999999'}
                tintColors={{
                  true: '#707070',
                  false: '#707070',
                }}
                style={styles.checkbox}
                value={true}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };
}

const mapStateToProps = (state) => ({
  isRefresh: state.User.isRefresh,
  lunches: state.User.lunches,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    updateMyLunch: () => {
      dispatch(userActions.updateMyLunch());
    },
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SecondMakeLunchScreen);

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
    flex: 1,
    flexDirection: 'row',
    paddingTop: scale(8),
    paddingStart: scale(8),
    borderColor: Colors.textBorderColor,
    borderWidth: 1,
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
    marginBottom: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableText: {
    ...ApplicationStyles.semiBoldFont,
    marginBottom: scale(8),
    fontSize: textScale(18),
    marginTop: scale(6),
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

  mainView: {
    flex: 1,
  },

  // item sub view
  itemSubView: {
    flexDirection: 'row',
    marginTop: scale(8),
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },

  // checkbox
  checkbox: {
    width: scale(16),
    height: scale(16),
    backgroundColor: isAndroid() ? 'transparent' : 'white',
  },
});
