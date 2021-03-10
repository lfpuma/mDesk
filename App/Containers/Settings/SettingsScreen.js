import React, {Component} from 'react';
import {View, Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MyBackGround from './../../Components/MyBackGround';
import TopLogo from './../../Components/TopLogo';
import Images from './../../Utils/Images';
import Colors from './../../Utils/Colors';
import ApplicationStyles from '../../Utils/ApplicationStyles';
import Value from '../../Utils/Value';
import MyBadge from '../../Components/MyBadge';
import {scaleVertical} from '../../Utils/scale';
import {textScale} from '../../Utils/textUtil';
import MyTitleView from '../../Components/MyTitleView';
import SettingsHome from '../../Components/SettingsHome';
import SettingsOffice from '../../Components/SettingsOffice';

const tagRadius = 30;

export default class SettingsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {homeTag: true};
  }

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
          <MyTitleView title={'Settings'} />
          {this.renderContent()}
        </View>
      </View>
    );
  }

  renderContent = () => (
    <View style={styles.bottomSheetView}>
      <View style={styles.tagView}>
        <TouchableOpacity
          style={[
            this.state.homeTag ? styles.selTagView : styles.unSelTagView,
            {borderTopLeftRadius: tagRadius},
          ]}
          onPress={() => this.setState({homeTag: true})}>
          <Text
            style={[
              this.state.homeTag
                ? styles.selTagViewText
                : styles.unSelTagViewText,
            ]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            !this.state.homeTag ? styles.selTagView : styles.unSelTagView,
            {borderTopRightRadius: tagRadius},
          ]}
          onPress={() => this.setState({homeTag: false})}>
          <Text
            style={[
              !this.state.homeTag
                ? styles.selTagViewText
                : styles.unSelTagViewText,
            ]}>
            Office
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomSheetMainView}>
        {this.state.homeTag && <SettingsHome />}
        {!this.state.homeTag && <SettingsOffice />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Tags
  tagView: {
    height: scaleVertical(40),
    flexDirection: 'row',
  },
  selTagView: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    height: scaleVertical(40),
    flex: 1,
  },
  unSelTagView: {
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    height: scaleVertical(40),
    margin: 1,
    flex: 1,
  },

  selTagViewText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(18),
    color: 'black',
  },
  unSelTagViewText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(18),
    color: 'white',
  },

  // Bottom Sheet
  bottomSheetView: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    borderColor: 'white',
    borderWidth: 0.3,
    borderTopLeftRadius: Value.mainRadius,
    borderTopRightRadius: Value.mainRadius,
    overflow: 'hidden',
  },
  bottomSheetMainView: {
    backgroundColor: 'white',
    flex: 1,
  },

  mainView: {
    flex: 1,
  },
});
