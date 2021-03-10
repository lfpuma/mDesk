import React, {Component} from 'react';
import {View, Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MyBackGround from './../../Components/MyBackGround';
import Images from './../../Utils/Images';
import Colors from './../../Utils/Colors';
import {scale, scaleVertical} from './../../Utils/scale';
import {textScale} from './../../Utils/textUtil';
import ApplicationStyles from '../../Utils/ApplicationStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import * as NavigationService from './../../Navigators/NavigationService';
import Value from '../../Utils/Value';
import {isAndroid} from '../../Utils/extension';
import {dialogUtil} from '../../Utils/dialogUtil';
import {_storeData} from '../../Utils/HelperService';
import {AzureInstance, AzureLoginView} from 'react-native-azure-ad-2';
import Constants from '../../Config/Constants';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      progressLogin: false,
    };

    //instantiate azure objects with your azure credentials
    this.azureInstance = new AzureInstance(Constants.credentials);
    this._onLoginSuccess = this._onLoginSuccess.bind(this);
  }

  _onLoginSuccess() {
    console.log(this.azureInstance.getToken());
    _storeData(this.azureInstance.getToken());
    NavigationService.navigate('Home');
  }

  handleLogin = async () => {
    // NavigationService.navigate('Home');
    this.setState({progressLogin: true});
  };

  componentDidMount() {
    const tokenExpired = this.props.navigation.getParam('tokenExpired');
    if (tokenExpired === true) {
      dialogUtil.showWarning('Token expired, You need to log in again.');
    }
  }

  render() {
    return this.state.progressLogin ? (
      <AzureLoginView
        azureInstance={this.azureInstance}
        loadingMessage=""
        onSuccess={this._onLoginSuccess}
      />
    ) : (
      <View style={styles.container}>
        <MyBackGround />
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.imageView}>
            <Image
              source={Images.letter_logo}
              style={styles.logo}
              resizeMode={'contain'}
            />
          </View>
          <View style={styles.mainView}>
            <Text style={styles.environmentsText}>
              The dynamic office of the future
            </Text>
            <View style={styles.mainSubView}>
              <Text style={styles.welcomeText}>Welcome to MyDesk</Text>
              <View style={styles.imageView}>
                <Image
                  source={Images.ic_login_logo}
                  style={styles.loginLogo}
                  resizeMode={'contain'}
                />
              </View>

              <TouchableOpacity
                style={styles.loginView}
                onPress={this.handleLogin}>
                <Text style={styles.loginText}>LOGIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: scale(200),
    height: scaleVertical(80),
    marginTop: scaleVertical(30),
  },
  loginLogo: {
    width: scale(60),
    height: scaleVertical(60),
    tintColor: Colors.primaryColor,
  },
  imageView: {
    width: '100%',
    alignItems: 'center',
  },
  mainView: {
    height: scaleVertical(280),
    marginLeft: scale(16),
    marginRight: scale(16),
    marginTop: scaleVertical(88),
    marginBottom: scaleVertical(36),
    backgroundColor: Colors.primaryColor,
    borderRadius: Value.mainRadius,
    flexDirection: 'column-reverse',
  },
  mainSubView: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: Value.mainRadius,
    paddingTop: scaleVertical(32),
    paddingLeft: scale(30),
    paddingRight: scale(30),
  },
  environmentsText: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(13),
    color: 'white',
    textAlign: 'center',
    marginBottom: scaleVertical(16),
    marginTop: scaleVertical(16),
    marginLeft: scale(40),
    marginRight: scale(40),
  },
  welcomeText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(20),
    width: '100%',
    textAlign: 'center',
    color: 'black',
    marginTop: scaleVertical(0),
  },
  textInput: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(15),
    width: '100%',
    borderColor: Colors.borderColor,
    borderWidth: 1,
    paddingHorizontal: scale(16),
    paddingTop: isAndroid() ? scaleVertical(8) : scaleVertical(2),
    paddingBottom: isAndroid() ? scaleVertical(6) : scaleVertical(2),
    borderRadius: scaleVertical(20),
    height: scaleVertical(40),
    marginTop: scaleVertical(14),
  },
  loginView: {
    width: '100%',
    backgroundColor: Colors.primaryColor,
    borderRadius: scaleVertical(20),
    height: scaleVertical(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaleVertical(16),
    marginBottom: scaleVertical(20),
  },
  loginText: {
    ...ApplicationStyles.boldFont,
    fontSize: textScale(16),
    color: 'white',
  },
});
