import React, {Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Overlay} from 'react-native-elements';
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
import * as NavigationService from './../..//Navigators/NavigationService';
import {isIphoneX, isAndroid} from '../../Utils/extension';

const itemHeight = scale(70);

export default class CheckInOfficeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      offices: Array.from({length: 10}),
      isRefreshing: false,
      modalVisible: false,
    };
  }

  handleYes() {
    this.setState({modalVisible: false});
    setTimeout(() => {
      this.props.navigation.goBack(null);
    }, 300);
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
        <View style={styles.mainView}>
          <View
            style={ApplicationStyles.homeMainView}
            opacity={Value.mainViewOpacity}
          />
          <MyTitleView title={'Check-In Office'} />
          {this.renderContent()}
        </View>
        <Overlay
          isVisible={this.state.modalVisible}
          width="auto"
          height="auto"
          overlayStyle={{borderRadius: Value.mainRadius}}>
          <View style={styles.rootModal}>
            <View
              style={
                // eslint-disable-next-line react-native/no-inline-styles
                {alignItems: 'center'}
              }>
              <Text style={styles.modalNormalText}>Are you sure to</Text>
              <Text style={styles.modalSpeText}>check-in</Text>
            </View>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => this.handleYes()}>
              <Text style={styles.modalConfirmButtonText}>Yes, Book it</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => this.setState({modalVisible: false})}>
              <Text style={styles.modalCancelButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </Overlay>
      </View>
    );
  }

  renderContent = () => (
    <View style={styles.bottomSheetView}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={this.state.offices}
        style={styles.flatList}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        ListEmptyComponent={this.ListEmptyView}
      />
    </View>
  );

  renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={{marginHorizontal: scale(35), marginTop: scaleVertical(12)}}
        onPress={() => this.setState({modalVisible: true})}>
        <View style={styles.itemView}>
          <View style={styles.leftView}>
            <Text style={styles.date1Text}>Sep</Text>
            <Text style={styles.date2Text}>02</Text>
          </View>
          <View style={styles.subItemView}>
            <Text style={styles.fullNameText}>CopenHagen, Hellerup</Text>
            <Text style={styles.normalText}>Support team</Text>
          </View>
        </View>
        <View style={styles.borderView} />
      </TouchableOpacity>
    );
  };
}

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
    height: isIphoneX() ? scaleVertical(74) : scaleVertical(88),
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
    fontSize: textScale(18),
    color: 'white',
  },
  subItemView: {
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

  mainView: {
    flex: 1,
  },

  // Modal
  rootModal: {
    width: scale(300),
    height: scaleVertical(260),
    borderRadius: Value.mainRadius,
    backgroundColor: 'white',
    paddingTop: scaleVertical(30),
  },
  modalNormalText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(21),
    color: Colors.color1,
  },
  modalSpeText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(21),
    color: 'black',
  },
  modalConfirmButton: {
    backgroundColor: Colors.primaryColor,
    borderRadius: scaleVertical(20),
    height: scaleVertical(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaleVertical(40),
    marginHorizontal: scale(24),
  },
  modalConfirmButtonText: {
    ...ApplicationStyles.boldFont,
    fontSize: textScale(16),
    color: 'white',
  },
  modalCancelButton: {
    backgroundColor: 'white',
    borderRadius: scaleVertical(20),
    borderColor: Colors.primaryColor,
    borderWidth: 1,
    height: scaleVertical(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaleVertical(16),
    marginHorizontal: scale(24),
  },
  modalCancelButtonText: {
    ...ApplicationStyles.boldFont,
    fontSize: textScale(16),
    color: 'black',
    paddingTop: isAndroid() ? scaleVertical(4) : scaleVertical(0),
  },
});
