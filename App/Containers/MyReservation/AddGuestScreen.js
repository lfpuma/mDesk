import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
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
import {
  isAndroid,
  xCoordinate,
  yCoordinate,
  myXCoordination,
  myYCoordination,
  convertPosToXCoord,
  convertPosToYCoord,
  xCoordinateForSeat,
  yCoordinateForSeat,
} from '../../Utils/extension';
import {apiManager} from '../../Network/APIManager';
import {dialogUtil} from '../../Utils/dialogUtil';
import * as userActions from '../../Sagas/UserSaga/actions';

const itemHeight = scale(68);

class AddGuestScreen extends Component {
  constructor(props) {
    super(props);

    this.reservation = props.navigation.getParam('reservation');
    this.ParkingReserved = props.navigation.getParam('ParkingReserved');
    this.me = props.navigation.getParam('email') ?? '';
    this.lunch = props.navigation.getParam('lunchIds') ?? [];
    this.lunchIds = [];

    if (this.lunch.length !== 0) {
      this.lunch.map((v) => this.lunchIds.push(v.id));
    }

    this.state = {
      modalVisible: false,
      parking: this.ParkingReserved ?? false,
      parkingAvailable: false,
      lunchIds: this.lunchIds,
      base64: null,
      reservation: {},
      XCoord: props.navigation.getParam('XCoord'),
      YCoord: props.navigation.getParam('YCoord'),
      // MyMap Position
      XPos: 0,
      YPos: 0,
      imageWidth: Value.reservationOriginMapWidth,
      imageHeight: Value.reservationOriginMapHeight,
      changeSeat: props.navigation.getParam('changeSeat') ?? false,
      guestName: props.navigation.getParam('userName') ?? '',
      guestEmail: props.navigation.getParam('email') ?? '',
      availableLunchList: [],
      parkingName: 'Parking',
      ParkingSpace: props.navigation.getParam('ParkingSpace') ?? '',
      SpecifySeats: false,
      Seats: [],

      // RequireSeatSelection
      RequireSeatSelection: true,
    };
  }

  handleBooking() {
    if (this.state.changeSeat) {
      this.handleUpdating();
      return;
    }

    if (this.state.guestName === '') {
      dialogUtil.showWarning('Guest Name required');
      return;
    }
    if (this.state.guestEmail === '') {
      dialogUtil.showWarning('Guest Email required');
      return;
    }

    const params = {
      Username: this.state.guestName,
      Email: this.state.guestEmail,
      ReservationId: this.reservation.Id,
      XCoord: this.state.XCoord,
      YCoord: this.state.YCoord,
      ParkingReserved: this.state.parking,
      LunchIds: this.state.lunchIds ?? [],
    };
    console.log(params);
    apiManager
      .createGuest(params)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        // if (res.status === 204) {
        //   dialogUtil.showNotice('Success', () => {
        //     this.props.navigation.goBack(null);
        //   });
        // } else {
        //   dialogUtil.showWarning(res.data.Message ?? 'Please try again later');
        // }
        const callback = () => {
          this.props.actions.updateMyReservationWithGuests(this.reservation.Id);
          this.props.navigation.goBack(null);
        };
        dialogUtil.showNotice('Success', 'Booked successfully!', callback);
      })
      .catch((err) => {
        console.log('createGuest ->', err);
        dialogUtil.showWarning('Please try again later');
      });
  }

  handleUpdating() {
    const params = {
      XCoord: this.state.XCoord,
      YCoord: this.state.YCoord,
      ParkingReserved: this.state.parking,
      LunchItems: this.state.lunchIds ?? [],
    };
    console.log(params);
    apiManager
      .updateGuest(this.props.navigation.getParam('guestId'), params)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        const callback = () => {
          this.props.actions.updateMyReservationWithGuests(this.reservation.Id);
          this.props.navigation.goBack(null);
        };
        dialogUtil.showNotice('Success', 'Updated successfully!', callback);
      })
      .catch((err) => {
        console.log('updateGuest ->', err);
        dialogUtil.showWarning('Please try again later');
      });
  }

  componentDidMount() {
    apiManager
      .getReservationLocation(this.reservation.Area.Id, this.reservation.Date)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        console.log(res.data);
        if (res.status === 200) {
          var RequireSeatSelection = true;
          if (res.data.Location != null) {
            RequireSeatSelection =
              res.data.Location.RequireSeatSelection ?? true;
          }
          let SpecifySeats = res.data.SpecifySeats ?? false;
          this.setState({
            reservation: res.data,
            SpecifySeats,
            RequireSeatSelection,
          });
          if (SpecifySeats) {
            this.catchSeats();
          }
          this.catchLunch();
        }
      })
      .catch((err) => console.log(`getReservationLocation error -> ${err}`));
    apiManager
      .getImage(this.reservation.Area.Id)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        if (res.status === 200) {
          Image.getSize(res.data.Image, (width, height) => {
            console.log(width, height);
            this.setState({
              base64: res.data.Image,
              imageWidth: width,
              imageHeight: height,
            });
          });
        }
      })
      .catch((err) => console.log(`getImage error -> ${err}`));
  }

  catchSeats() {
    apiManager.getSeats(this.reservation.Area.Id).then((res) => {
      console.log(res);
      apiManager.checkLoginStatus(res);
      if (res.status === 200) {
        const newSeats = [];
        for (let i = 0; i < res.data.Seats.length; i++) {
          let seat = res.data.Seats[i];
          newSeats.push({
            ...seat,
            isSet: false,
          });
        }
        this.setState({
          Seats: res.data.Seats ?? [],
        });
      }
    });
  }

  catchLunch() {
    console.log(this.reservation.Date);
    if (this.reservation.Area?.Location != null) {
      apiManager
        .getLunches(this.reservation.Area?.Location.Id, this.reservation.Date)
        .then((res) => {
          console.log(res);
          apiManager.checkLoginStatus(res);
          if (res.status === 200) {
            if (
              res.data.PreBookingDetails != null &&
              res.data.PreBookingDetails.length !== 0
            ) {
              let PreBookingDetails = res.data.PreBookingDetails[0];
              const parkingName = PreBookingDetails.ParkingSpaceName ?? '';
              const availableLunchList = PreBookingDetails.LunchItems ?? [];
              this.setState({
                parkingAvailable: PreBookingDetails.ParkingAvailable,
                parkingName,
                availableLunchList,
              });
            }
          }
        });
    }
  }

  onClickParking() {
    if (!this.state.parkingAvailable) {
      return;
    }
    this.setState({parking: !this.state.parking});
  }

  onClickLunch(lunchAvailable, id) {
    if (!lunchAvailable || id === 0) {
      return;
    }
    const lunchIds = [...this.state.lunchIds];
    const index = lunchIds.indexOf(id);
    if (index !== -1) {
      lunchIds.splice(index, 1);
    } else {
      lunchIds.push(id);
    }
    this.setState({
      lunchIds,
    });
  }

  onClickMap(position) {
    if (!this.state.RequireSeatSelection) {
      return;
    }

    var XCoord = convertPosToXCoord(
      position.locationX,
      this.state.imageWidth,
      this.state.imageHeight,
    );
    var YCoord = convertPosToYCoord(
      position.locationY,
      this.state.imageWidth,
      this.state.imageHeight,
    );

    if (this.state.SpecifySeats) {
      var canEdit = false;
      const limit = Value.seatRangeSize;
      this.state.Seats.forEach((v) => {
        if (
          v.XCoord - limit <= XCoord &&
          v.XCoord + limit >= XCoord &&
          v.YCoord - limit <= YCoord &&
          v.YCoord + limit >= YCoord
        ) {
          canEdit = true;
          XCoord = v.XCoord;
          YCoord = v.YCoord;
        }
      });
      if (!canEdit) {
        return;
      }
    }

    this.setState({
      XCoord,
      YCoord,
    });
  }

  _onTextContentSizeChange(layout, markerId) {
    if (this.state.reservation.ReservationsByDate != null) {
      var newReservations = [];
      this.state.reservation.ReservationsByDate.map((reservationsByDate) => {
        var newReservationsByDate = [];
        reservationsByDate.ReservationsByDate.map((v) => {
          var newGuests = [];
          if (v.Guests != null) {
            v.Guests.map((g) => {
              if (g.Id === markerId) {
                newGuests.push({
                  ...g,
                  calcHeight: layout.height,
                  calcWidth: layout.width,
                  left: xCoordinate(
                    g.XCoord,
                    layout.width,
                    this.state.imageWidth,
                    this.state.imageHeight,
                  ),
                  top: yCoordinate(
                    g.YCoord,
                    layout.height,
                    this.state.imageWidth,
                    this.state.imageHeight,
                  ),
                });
              } else {
                newGuests.push(g);
              }
            });
          }
          if (markerId === v.Id) {
            newReservationsByDate.push({
              ...v,
              Guests: newGuests,
              calcHeight: layout.height,
              calcWidth: layout.width,
              left: xCoordinate(
                v.XCoord,
                layout.width,
                this.state.imageWidth,
                this.state.imageHeight,
              ),
              top: yCoordinate(
                v.YCoord,
                layout.height,
                this.state.imageWidth,
                this.state.imageHeight,
              ),
            });
          } else {
            newReservationsByDate.push({
              ...v,
              Guests: newGuests,
            });
          }
        });
        newReservations.push({ReservationsByDate: newReservationsByDate});
      });
      this.state.reservation = {
        ...this.state.reservation,
        ReservationsByDate: newReservations,
      };
      this.setState({
        reservation: {
          ...this.state.reservation,
          ReservationsByDate: newReservations,
        },
      });
    }
  }

  renderLunch() {
    const {availableLunchList} = this.state;
    if (availableLunchList.length === 0) {
      return <Text style={styles.lunchNAText}>Lunch Not Available</Text>;
    }
    return (
      <View>
        {availableLunchList.map((v, i) => (
          <TouchableOpacity
            key={i}
            style={styles.checkBoxes}
            onPress={() => this.onClickLunch(v.IsAvailable ?? false, v.id ?? 0)}
            activeOpacity={1.0}>
            <CheckBox
              boxType={'square'}
              disabled={!(v.IsAvailable ?? false) || isAndroid()}
              tintColors={
                v.IsAvailable ?? false
                  ? {true: Colors.primaryColor, false: Colors.primaryColor}
                  : {true: Colors.color1, false: Colors.color1}
              }
              style={styles.checkbox}
              value={this.state.lunchIds.indexOf(v.id) !== -1}
            />
            <Text
              style={
                v.IsAvailable ?? false
                  ? styles.checkBoxText
                  : styles.disableCheckBoxText
              }>
              {v.Name ?? ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
          <MyTitleView
            title={this.state.changeSeat ? 'Change Seat' : 'Add Guest'}
          />
          {this.renderContent()}
        </View>
      </View>
    );
  }

  renderContent = () => (
    <ScrollView
      style={styles.bottomSheetView}
      showsVerticalScrollIndicator={false}>
      <TextInput
        editable={!this.state.changeSeat}
        placeholder={'Guest Name'}
        placeholderTextColor={Colors.color1}
        style={styles.textInput}
        keyboardType={'default'}
        enablesReturnKeyAutomatically
        returnKeyType="next"
        value={this.state.guestName}
        onChangeText={(guestName) => this.setState({guestName})}
        blurOnSubmit={true}
        onSubmitEditing={() => {
          this.emailRef.focus();
        }}
      />
      <TextInput
        editable={!this.state.changeSeat}
        ref={(ti) => {
          this.emailRef = ti;
        }}
        placeholder={'Guest Email'}
        placeholderTextColor={Colors.color1}
        style={styles.textInput}
        keyboardType={'default'}
        enablesReturnKeyAutomatically
        returnKeyType="done"
        value={this.state.guestEmail}
        onChangeText={(guestEmail) => this.setState({guestEmail})}
      />
      <View style={styles.borderView} />
      <ScrollView
        style={styles.locationView}
        maximumZoomScale={Value.maximumZoomScale}
        minimumZoomScale={Value.minimumZoomScale}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {this.state.base64 && (
          <Image
            // source={Images.location_temp1}
            source={{uri: this.state.base64}}
            style={styles.locationImage}
            resizeMode={'contain'}
          />
        )}
        {this.state.base64 &&
          this.state.Seats.map((seat) => {
            return this.renderSeat(seat);
          })}
        {this.state.base64 && (
          <TouchableOpacity
            style={styles.markerView}
            activeOpacity={1.0}
            onLayout={(event) => {
              console.log(event.nativeEvent.layout);
              this.setState({
                XPos: event.nativeEvent.layout.x,
                YPos: event.nativeEvent.layout.y,
              });
            }}
            onPress={(event) => this.onClickMap(event.nativeEvent)}>
            {this.state.reservation.ReservationsByDate &&
              this.state.reservation.ReservationsByDate.map(
                (reservationsByDate) =>
                  reservationsByDate.ReservationsByDate.map((v) => {
                    return this.renderCusMarker(v, false);
                    // if (v.Guests != null) {
                    //   return v.Guests.map((g) => this.renderCusMarker(g, true));
                    // } else {
                    //   return this.renderCusMarker(v, false);
                    // }
                  }),
              )}
            {this.renderMyLocation()}
          </TouchableOpacity>
        )}
      </ScrollView>
      <View style={styles.borderView} />
      <TouchableOpacity
        style={styles.checkBoxes}
        onPress={() => this.onClickParking()}
        activeOpacity={1.0}>
        <CheckBox
          boxType={'square'}
          disabled={!this.state.parkingAvailable || isAndroid()}
          tintColors={
            this.state.parkingAvailable
              ? {true: Colors.primaryColor, false: Colors.primaryColor}
              : {true: Colors.color1, false: Colors.color1}
          }
          style={styles.checkbox}
          value={this.state.parking}
        />
        <Text
          style={
            this.state.parkingAvailable
              ? styles.checkBoxText
              : styles.disableCheckBoxText
          }>
          {this.state.changeSeat && this.state.ParkingSpace !== ''
            ? this.state.ParkingSpace
            : this.state.parkingName}
        </Text>
      </TouchableOpacity>

      {this.renderLunch()}

      {/*<TouchableOpacity*/}
      {/*  style={styles.checkBoxes}*/}
      {/*  onPress={() => this.setState({lunch: !this.state.lunch})}*/}
      {/*  activeOpacity={1.0}>*/}
      {/*  <CheckBox*/}
      {/*    boxType={'square'}*/}
      {/*    tintColors={{true: Colors.primaryColor, false: Colors.primaryColor}}*/}
      {/*    style={styles.checkbox}*/}
      {/*    value={this.state.lunch}*/}
      {/*    // onValueChange={() => this.setState({lunch: !this.state.lunch})}*/}
      {/*  />*/}
      {/*  <Text style={styles.checkBoxText}>Lunch</Text>*/}
      {/*</TouchableOpacity>*/}
      <View style={styles.lastView}>
        <TouchableOpacity
          style={styles.book}
          onPress={() => this.handleBooking()}>
          <Text style={styles.bookText}>
            {this.state.changeSeat ? 'Update' : 'Book'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  renderMyLocation = () =>
    this.state.XCoord >= 0 &&
    this.state.YCoord >= 0 && (
      <View
        style={[
          styles.markerContainerView,
          {
            left: myXCoordination(
              this.state.XCoord,
              this.state.imageWidth,
              this.state.imageHeight,
            ),
            top: myYCoordination(
              this.state.YCoord,
              this.state.imageWidth,
              this.state.imageHeight,
            ),
          },
        ]}>
        <Image
          source={Images.ic_location}
          style={styles.mapMarker}
          resizeMode={'contain'}
        />
      </View>
    );

  renderSeat = (seat) =>
    seat.XCoord >= 0 &&
    seat.YCoord >= 0 && (
      <View
        style={[
          styles.seatContainerView,
          {
            left: xCoordinateForSeat(
              seat.XCoord,
              this.state.imageWidth,
              this.state.imageHeight,
            ),
            top: yCoordinateForSeat(
              seat.YCoord,
              this.state.imageWidth,
              this.state.imageHeight,
            ),
          },
        ]}>
        <View style={styles.seatImage} />
      </View>
    );

  renderCusMarker = (marker, isGuest) => {
    return (
      <View key={marker.Id}>
        {marker.Email !== this.me && (
          <View
            style={[
              styles.markerContainerView,
              {
                left: marker.left ?? 0,
                top: marker.top ?? 0,
              },
            ]}
            key={marker.Id}>
            <View style={styles.markerTextView}>
              <Text
                style={styles.markerText}
                onLayout={(event) => {
                  this._onTextContentSizeChange(
                    event.nativeEvent.layout,
                    marker.Id,
                  );
                }}>
                {marker.Username}
                {isGuest ? ' (Guest)' : ''}
              </Text>
            </View>
            <Image
              source={Images.ic_map_pin}
              style={styles.mapPin}
              resizeMode={'contain'}
            />
          </View>
        )}
        {marker.Guests != null &&
          marker.Guests.map((g) => this.renderCusMarker(g, true))}
      </View>
    );
  };
}

const mapStateToProps = (state) => ({
  user: state.User.user,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    updateMyReservationWithGuests: (reservationId) => {
      dispatch(userActions.updateMyReservationWithGuests(reservationId));
    },
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddGuestScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Modal
  rootModal: {
    width: scale(300),
    height: scaleVertical(320),
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

  //locationView
  locationView: {
    height: Value.reservationMapHeight,
    marginTop: scaleVertical(15),
  },
  locationImage: {
    height: Value.reservationMapHeight,
  },

  // MarkerView
  markerView: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  markerContainerView: {
    position: 'absolute',
    alignItems: 'center',
  },
  mapPin: {
    width: Value.mapPinSize,
    height: Value.mapPinSize,
    tintColor: Colors.primaryColor,
  },
  markerTextView: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 6,
    paddingHorizontal: Value.mapPinLeftPadding * 2,
    paddingVertical: Value.mapPinTopPadding * 2,
  },
  markerText: {
    ...ApplicationStyles.regularFont,
    fontSize: Value.mapPinTextSize,
    color: 'white',
  },

  // Seat
  seatContainerView: {
    position: 'absolute',
  },
  seatImage: {
    width: Value.seatRangeSize,
    height: Value.seatRangeSize,
    borderRadius: Value.seatRangeSize / 2,
    backgroundColor: '#009518',
    opacity: 0.7,
  },

  // Map Marker
  mapMarker: {
    width: Value.myMapMarkerSize,
    height: Value.myMapMarkerSize,
    tintColor: Colors.primaryColor,
  },

  // lastView
  lastView: {
    marginBottom: scaleVertical(20),
  },
  book: {
    backgroundColor: Colors.primaryColor,
    borderRadius: scaleVertical(20),
    height: scaleVertical(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaleVertical(16),
    marginBottom: scaleVertical(10),
    marginLeft: scale(36),
    marginRight: scale(36),
  },
  bookText: {
    ...ApplicationStyles.boldFont,
    fontSize: textScale(16),
    color: 'white',
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
    color: 'black',
  },
  disableCheckBoxText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
    marginLeft: scale(16),
    color: Colors.color1,
  },
  checkbox: {
    width: scale(16),
    height: scale(16),
    marginTop: scaleVertical(2),
  },
  lunchNAText: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(14),
    marginTop: scale(16),
    marginBottom: scale(8),
    marginLeft: scale(34),
    color: 'red',
  },

  // First Component
  firstView: {
    marginTop: scaleVertical(24),
    marginHorizontal: scale(35),
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },

  // Left Component
  leftView: {
    flex: 1,
  },
  leftText1: {
    ...ApplicationStyles.mediumFont,
    fontSize: textScale(16),
    color: 'black',
  },
  leftText2: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(20),
    color: 'black',
    marginTop: scaleVertical(8),
  },
  leftText3: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(11),
    color: 'black',
    marginTop: scaleVertical(8),
  },

  // Right Component
  rightView: {
    width: itemHeight,
    height: itemHeight,
    borderRadius: 8,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seats1Text: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(13),
    color: 'white',
  },
  seats2Text: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(16),
    color: 'white',
    marginTop: scaleVertical(4),
  },

  // Bottom Sheet
  bottomSheetView: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: Value.mainRadius,
    borderTopRightRadius: Value.mainRadius,
    paddingTop: scaleVertical(10),
  },
  borderView: {
    backgroundColor: Colors.borderColor,
    height: 1,
    marginTop: scaleVertical(16),
  },

  mainView: {
    flex: 1,
  },

  // Text View
  textInput: {
    ...ApplicationStyles.regularFont,
    fontSize: textScale(15),
    borderColor: Colors.textBorderColor,
    borderWidth: 1,
    paddingHorizontal: scale(16),
    paddingTop: isAndroid() ? scaleVertical(8) : scaleVertical(2),
    paddingBottom: isAndroid() ? scaleVertical(6) : scaleVertical(2),
    borderRadius: scaleVertical(20),
    height: scaleVertical(40),
    marginTop: scaleVertical(14),
    marginLeft: scale(30),
    marginRight: scale(30),
  },
});
