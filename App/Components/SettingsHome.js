import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {scaleVertical, scale} from '../Utils/scale';
import {textScale} from '../Utils/textUtil';
import ApplicationStyles from '../Utils/ApplicationStyles';
import Images from '../Utils/Images';
import Colors from '../Utils/Colors';
import CheckBox from '@react-native-community/checkbox';
import MapView, {Marker} from 'react-native-maps';
import {getPlaceDetailWithCoordinates} from '../Utils/extension';

class SettingsHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isNotification: true,
      isReminder: true,
      seatAvailable: true,
      latitude: props.currentLocation.latitude,
      longitude: props.currentLocation.longitude,
      address: '',
    };
  }

  componentDidMount() {
    // getCurrentLocation()
    //   .then((json) => {
    //     const location = JSON.parse(json);
    //     this.setState({
    //       latitude: location.latitude,
    //       longitude: location.longitude,
    //     });
    //   })
    //   .catch((error) => {
    //     console.log('getCurrentLocation error -> ', error);
    //   });
    getPlaceDetailWithCoordinates(
      this.props.currentLocation.latitude,
      this.props.currentLocation.longitude,
      (res) => {
        if (res.length >= 1) {
          this.setState({address: res[0].formatted_address});
        }
      },
    );
  }

  changeRegion() {
    this.mapRef.current.animateToRegion({
      latitude: Number(this.state.latitude - 0.01),
      longitude: Number(this.state.longitude),
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  }

  render() {
    // const place = {latitude: 55.676098, longitude: 12.568337};
    const place = {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
    };
    return (
      <ScrollView style={ApplicationStyles.fullView}>
        <View style={styles.firstView}>
          <Image
            source={Images.ic_location}
            style={styles.locationIcon}
            resizeMode={'contain'}
          />
          <Text style={styles.locationText}>{this.state.address}</Text>
        </View>
        <View style={styles.borderView} />
        <View style={styles.mapParentView} pointerEvents="none">
          <MapView
            ref={this.mapRef}
            pointerEvents="none"
            initialRegion={{
              latitude: Number(place.latitude - 0.01),
              longitude: Number(place.longitude),
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            style={ApplicationStyles.fullView}>
            <Marker
              coordinate={{
                latitude: Number(place.latitude),
                longitude: Number(place.longitude),
              }}
              image={Images.ic_location}
            />
          </MapView>
        </View>
        <View style={styles.borderView} />
        {/* <View style={styles.notificationView}>
          <Text style={styles.notificationViewText}>PUSH notifications</Text>
          <Switch
            trackColor={{false: 'white', true: Colors.primaryColor}}
            ios_backgroundColor="white"
            onValueChange={(val) => this.setState({isNotification: val})}
            value={this.state.isNotification}
          />
        </View>

        <TouchableOpacity
          style={styles.checkBoxes}
          onPress={() => this.setState({isReminder: !this.state.isReminder})}
          activeOpacity={1.0}>
          <CheckBox
            boxType={'square'}
            tintColors={{true: Colors.primaryColor, false: Colors.primaryColor}}
            style={styles.checkbox}
            value={this.state.isReminder}
          />
          <Text style={styles.checkBoxText}>Reminder for check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkBoxes}
          onPress={() =>
            this.setState({seatAvailable: !this.state.seatAvailable})
          }
          activeOpacity={1.0}>
          <CheckBox
            boxType={'square'}
            tintColors={{true: Colors.primaryColor, false: Colors.primaryColor}}
            style={styles.checkbox}
            value={this.state.seatAvailable}
          />
          <Text style={styles.checkBoxText}>Notify in seat available/full</Text>
        </TouchableOpacity> */}
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  currentLocation: state.User.currentLocation,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsHome);

const styles = StyleSheet.create({
  // mapParentView
  mapParentView: {
    height: scaleVertical(200),
  },

  // Notification View
  notificationView: {
    flexDirection: 'row',
    marginHorizontal: scale(35),
    marginTop: scale(30),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationViewText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(17),
  },

  // First View
  firstView: {
    marginHorizontal: scale(36),
    flexDirection: 'row',
    height: scaleVertical(80),
    alignItems: 'center',
  },
  locationIcon: {
    width: scale(20),
    height: scale(20),
  },
  locationText: {
    ...ApplicationStyles.mediumFont,
    marginLeft: scale(16),
    fontSize: textScale(13),
  },
  borderView: {
    backgroundColor: Colors.borderColor,
    height: 1,
  },

  // Checkbox
  checkBoxes: {
    flexDirection: 'row',
    marginTop: scaleVertical(20),
    marginHorizontal: scale(35),
    alignSelf: 'baseline',
  },
  checkBoxText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
    marginLeft: scale(16),
  },
  checkbox: {
    width: scale(16),
    height: scale(16),
    marginTop: scaleVertical(2),
    borderColor: 'black',
  },
});
