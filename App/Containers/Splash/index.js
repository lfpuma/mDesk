import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Image, Platform, PermissionsAndroid} from 'react-native';
import {store} from '../../Sagas/store';
import {styles} from './styles';
import MyBackGround from './../../Components/MyBackGround';
import Images from './../../Utils/Images';
import Geolocation from 'react-native-geolocation-service';
import {getCurrentPosition} from '../../Utils/extension';
import * as userActions from '../../Sagas/UserSaga/actions';

class SplashScreen extends Component {
  async componentDidMount() {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('always');
    } else {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need location access to get your current location',
        },
      );
    }

    var currentLocation = {
      latitude: 55.676098,
      longitude: 12.568337,
    };

    try {
      const location = await getCurrentPosition();
      currentLocation.latitude = location.coords.latitude;
      currentLocation.longitude = location.coords.longitude;
      // _storeLocation(currentLocation);
      this.props.actions.updateLocation(currentLocation);
    } catch (error) {
      console.log(error);
    }

    setTimeout(() => {
      // NavigationService.navigate('Login');
      store.dispatch({type: 'StartUp/CHECK_LOGIN'});
    }, 500);
  }

  render() {
    return (
      <View style={styles.container}>
        <MyBackGround />
        <Image
          source={Images.letter_logo}
          style={styles.logo}
          resizeMode={'contain'}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    updateLocation: (currentLocation) => {
      dispatch(userActions.updateLocation(currentLocation));
    },
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);
