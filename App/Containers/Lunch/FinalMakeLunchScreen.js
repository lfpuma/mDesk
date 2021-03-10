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
import {convertSTimeToLMonth, convertSTimeToLDay} from '../../Utils/extension';
import {Overlay} from 'react-native-elements';
import Spinner from 'react-native-spinkit';

const itemHeight = scale(54);

class FinalMakeLunchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      lunches: [1, 2],
    };
  }

  componentDidMount() {}

  handleNext = () => {
    NavigationService.navigate('LunchDetail');
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

  ListFooter = () => {
    return (
      <View style={styles.footerView}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalText}>DKK 110,-</Text>
      </View>
    );
  };

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
          <Text style={styles.addButtonText}>Confirm</Text>
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
      <FlatList
        showsVerticalScrollIndicator={false}
        data={this.state.lunches}
        style={styles.flatList}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        ListEmptyComponent={this.ListEmptyView}
        ListFooterComponent={this.ListFooter}
      />
    </View>
  );

  renderItem = ({item, index}) => {
    return (
      <View
        style={{marginHorizontal: scale(24), marginBottom: scaleVertical(12)}}>
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
          <View style={styles.subItemView}>
            <Text style={styles.fullNameText}>2 x Lunch - 11:45 - 12:15</Text>
            <Text style={styles.fullNameText}>DKK 55, -</Text>
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
)(FinalMakeLunchScreen);

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
    flex: 1,
    marginLeft: scale(16),
    marginBottom: scale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullNameText: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(13),
    marginTop: scale(4),
  },
  totalText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(15),
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

  mainView: {
    flex: 1,
  },

  // footer
  footerView: {
    marginBottom: scale(60),
    marginHorizontal: scale(24),
    marginTop: scale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
