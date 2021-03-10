import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
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
import {Alert} from 'react-native';

class LunchDetailScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      lunches: [1, 2],
    };
  }

  componentDidMount() {}

  handleClose = () => {
    NavigationService.navigate('MyLunch');
  };

  handleCancel = () => {
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
            // TODO -> cancel lunch.
          },
        },
      ],
      {cancelable: false},
    );
  };

  keyExtractor = (item, index) => index.toString();

  renderHeader() {
    return (
      <View style={ApplicationStyles.headerView}>
        <TouchableOpacity
          style={ApplicationStyles.headerLeft}
          onPress={this.handleClose}>
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
    return (
      <View style={styles.container}>
        <MyBackGround />
        {this.renderHeader()}
        <View style={styles.mainView}>
          <View
            style={ApplicationStyles.homeMainView}
            opacity={Value.mainViewOpacity}
          />
          <MyTitleView title={'Lunch receipt - 04 nov 2020'} />
          {this.renderContent()}
        </View>
        <TouchableOpacity
          style={styles.cancelButtonView}
          onPress={this.handleCancel}>
          <Text style={styles.addButtonText}>Cancel lunch</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButtonView}
          onPress={this.handleClose}>
          <Text style={styles.addButtonText}>Close</Text>
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
      <View style={styles.subItemView}>
        <Text style={styles.fullNameText}>2 x Lunch - 11:45 - 12:15</Text>
        <Text style={styles.fullNameText}>DKK 110,-</Text>
      </View>
      <View style={styles.qrContainer}>
        <View>
          <Image
            source={Images.ic_qr_border}
            style={styles.qrBorder}
            resizeMode={'contain'}
          />
          <Image
            source={Images.ic_qr_content_template}
            style={styles.qrContent}
            resizeMode={'contain'}
          />
        </View>
      </View>
    </View>
  );
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

export default connect(mapStateToProps, mapDispatchToProps)(LunchDetailScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  subItemView: {
    marginHorizontal: scale(28),
    marginTop: scale(40),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullNameText: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(14),
    marginTop: scale(4),
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
  cancelButtonView: {
    backgroundColor: Colors.primaryColor,
    borderRadius: scale(20),
    height: scale(40),
    width: scale(150),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: scaleVertical(30),
    left: scale(32),
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
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(100),
  },
  qrBorder: {
    width: scale(240),
    height: scale(240),
  },
  qrContent: {
    width: scale(180),
    height: scale(180),
    position: 'absolute',
    margin: scale(30),
  },
});
