import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Overlay} from 'react-native-elements';
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
  getLTime,
  xCoordinate,
  yCoordinate,
  getSTimeForPost,
  myXCoordination,
  myYCoordination,
  convertPosToXCoord,
  convertPosToYCoord,
  xCoordinateForSeat,
  yCoordinateForSeat,
} from '../../Utils/extension';
import Spinner from 'react-native-spinkit';
import {apiManager} from '../../Network/APIManager';
import {dialogUtil} from '../../Utils/dialogUtil';
import * as userActions from '../../Sagas/UserSaga/actions';
import CustomRadioBox from '../../Components/CustonRadioBox';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import MapZoomCancelButton from '../../Components/MapZoomCancelButton';

const itemHeight = scale(68);

class BookReservationScreen extends Component {
  constructor(props) {
    super(props);

    this.reservationId = props.navigation.getParam('reservationId');
    this.reservation = props.navigation.getParam('reservation');
    this.ParkingReserved = props.navigation.getParam('ParkingReserved');
    this.dates = props.navigation.getParam('dates');
    this.changeSeat = props.navigation.getParam('changeSeat') ?? false;
    this.lunch = props.navigation.getParam('lunchIds') ?? [];
    this.lunchIds = [];
    this.seat = null;

    if (this.lunch.length !== 0) {
      this.lunch.map((v) => this.lunchIds.push(v.id));
    }

    const bookings = [];
    this.dates.map((date) => {
      bookings.push({
        date,
        XCoord: -1,
        YCoord: -1,
        parking: this.ParkingReserved ?? false,
        lunchIds: this.lunchIds,
      });
    });

    this.state = {
      modalVisible: false,
      base64: null,
      reservation: {},
      alreadyBooked: false,
      // MyMap Position
      XPos: 0,
      YPos: 0,
      changeSeat: this.changeSeat,
      imageWidth: Value.reservationOriginMapWidth,
      imageHeight: Value.reservationOriginMapHeight,
      bookings,
      currentIndex: 0,
      isLoading: false,
      parkingAvailable: false,
      availableLunchList: [],
      parkingName: 'Parking',
      ParkingSpace: props.navigation.getParam('ParkingSpace') ?? '',
      SpecifySeats: false,
      Seats: [],

      // RequireSeatSelection
      RequireSeatSelection: true,
      parentScrollEnabled: true,
    };
  }

  goBack() {
    this.props.navigation.goBack(null);
  }

  handlePrevious() {
    this.setState({currentIndex: this.state.currentIndex - 1, isLoading: true});
    setTimeout(() => {
      this.catchLocation();
    }, 500);
  }

  handleNext() {
    this.setState({currentIndex: this.state.currentIndex + 1, isLoading: true});
    setTimeout(() => {
      this.catchLocation();
    }, 500);
  }

  handleBooking() {
    const bookData = this.state.bookings.filter((v) => v.XCoord === -1);
    if (bookData.length !== 0) {
      dialogUtil.showWarning(
        'Some pins of reservation are missing. please complete your reservation.',
      );
      return;
    }

    if (this.state.changeSeat) {
      this.handleUpdating();
      return;
    }
    if (this.state.alreadyBooked) {
      dialogUtil.showWarning('You already booked this team');
      return;
    }

    this.setState({modalVisible: true});
  }

  handleYes() {
    this.setState({modalVisible: false});
    const reservations = [];
    this.state.bookings.map((booking) => {
      console.log(booking);
      if (this.seat != null) {
        reservations.push({
          Date: getSTimeForPost(booking.date),
          XCoord: booking.XCoord === -1 ? 0 : booking.XCoord,
          YCoord: booking.YCoord === -1 ? 0 : booking.YCoord,
          ParkingReserved: booking.parking,
          LunchIds: booking.lunchIds ?? [],
          SeatId: this.seat.Id,
        });
      } else {
        reservations.push({
          Date: getSTimeForPost(booking.date),
          XCoord: booking.XCoord === -1 ? 0 : booking.XCoord,
          YCoord: booking.YCoord === -1 ? 0 : booking.YCoord,
          ParkingReserved: booking.parking,
          LunchIds: booking.lunchIds ?? [],
        });
      }
    });
    const params = {
      AreaId: this.reservation.Id,
      Reservations: reservations,
    };
    console.log(params);
    apiManager
      .createReservation(params)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        const callback = () => {
          this.props.actions.updateMyReservation();
          this.goBack();
        };
        dialogUtil.showNotice('Success', 'Booked successfully!', callback);
      })
      .catch((err) => {
        console.log('createReservation ->', err);
        dialogUtil.showWarning('Please try again later');
      });
  }

  handleUpdating() {
    let params;
    if (this.seat != null) {
      params = {
        XCoord: this.state.bookings[0].XCoord,
        YCoord: this.state.bookings[0].YCoord,
        ParkingReserved: this.state.bookings[0].parking,
        LunchItems: this.state.bookings[0].lunchIds ?? [],
        SeatId: this.seat.Id,
      };
    } else {
      params = {
        XCoord: this.state.bookings[0].XCoord,
        YCoord: this.state.bookings[0].YCoord,
        ParkingReserved: this.state.bookings[0].parking,
        LunchItems: this.state.bookings[0].lunchIds ?? [],
      };
    }
    apiManager
      .updateReservation(this.reservationId, params)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        const callback = () => {
          this.props.actions.updateMyReservation();
          this.goBack();
        };
        dialogUtil.showNotice('Success', 'Updated successfully!', callback);
      })
      .catch((err) => {
        console.log('updateReservation ->', err);
        dialogUtil.showWarning('Please try again later');
      });
  }

  componentDidMount() {
    this.catchLocation();
    apiManager
      .getImage(this.reservation.Id)
      .then((res) => {
        apiManager.checkLoginStatus(res);
        if (res.status === 200) {
          Image.getSize(res.data.Image, (width, height) => {
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

  getNewBookings(XCoord, YCoord, notChangedByUser) {
    const newBookings = [];
    for (var i = 0; i < this.state.bookings.length; i++) {
      if (this.state.currentIndex === i) {
        const isAlreadySet =
          this.state.bookings[this.state.currentIndex].XCoord !== -1 &&
          notChangedByUser;
        newBookings.push({
          ...this.state.bookings[i],
          XCoord: isAlreadySet
            ? this.state.bookings[this.state.currentIndex].XCoord
            : XCoord,
          YCoord: isAlreadySet
            ? this.state.bookings[this.state.currentIndex].YCoord
            : YCoord,
        });
      } else {
        newBookings.push(this.state.bookings[i]);
      }
    }
    return newBookings;
  }

  getNewBookingsForParking() {
    const newBookings = [];
    for (var i = 0; i < this.state.bookings.length; i++) {
      if (this.state.currentIndex === i) {
        newBookings.push({
          ...this.state.bookings[i],
          parking: !this.state.bookings[i].parking,
        });
      } else {
        newBookings.push(this.state.bookings[i]);
      }
    }
    return newBookings;
  }

  getNewBookingsForLunch(id) {
    const newBookings = [];
    for (let i = 0; i < this.state.bookings.length; i++) {
      if (this.state.currentIndex === i) {
        // const lunchIds = [...this.state.bookings[i].lunchIds];
        // console.log(lunchIds);
        // const index = lunchIds.indexOf(id);
        // if (index !== -1) {
        //   lunchIds.splice(index, 1);
        // } else {
        //   lunchIds.push(id);
        // }
        newBookings.push({
          ...this.state.bookings[i],
          lunchIds: [id],
        });
      } else {
        newBookings.push(this.state.bookings[i]);
      }
    }
    return newBookings;
  }

  catchSeats() {
    apiManager.getSeats(this.reservation.Id).then((res) => {
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
    if (this.reservation.Location != null) {
      apiManager
        .getLunches(
          this.reservation.Location.Id,
          this.state.bookings[this.state.currentIndex].date,
        )
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

  catchLocation() {
    apiManager
      .getReservationLocation(
        this.reservation.Id,
        this.state.bookings[this.state.currentIndex].date,
      )
      .then((res) => {
        console.log(res.data);
        apiManager.checkLoginStatus(res);
        if (res.status === 200) {
          var myBooking = [];
          if (res.data.ReservationsByDate != null) {
            res.data.ReservationsByDate.map((reservationsByDate) => {
              myBooking = reservationsByDate.ReservationsByDate.filter(
                (v) => v.Email === this.props.user.Email,
              );
            });
          }

          var XCoord = myBooking.length !== 0 ? myBooking[0].XCoord : -1;
          var YCoord = myBooking.length !== 0 ? myBooking[0].YCoord : -1;

          var parkingAvailable = false;
          var RequireSeatSelection = true;
          if (res.data.Location != null) {
            parkingAvailable = res.data.Location.ParkingAvailable ?? false;
            RequireSeatSelection =
              res.data.Location.RequireSeatSelection ?? true;
          }

          let SpecifySeats = res.data.SpecifySeats ?? false;
          this.setState({
            isLoading: false,
            reservation: res.data,
            // alreadyBooked: myBooking.length === 0 ? false : true,
            bookings: this.getNewBookings(XCoord, YCoord, true),
            parkingAvailable,
            SpecifySeats,
            RequireSeatSelection,
          });
          if (SpecifySeats) {
            this.catchSeats();
          }
          this.catchLunch();
        }
      })
      .catch((err) => {
        this.setState({isLoading: false});
        console.log(`getReservationLocation error -> ${err}`);
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
          this.seat = v;
        }
      });
      if (!canEdit) {
        return;
      }
    }

    this.setState({
      bookings: this.getNewBookings(XCoord, YCoord, false),
    });
  }
  onClickParking() {
    if (!this.state.parkingAvailable) {
      return;
    }
    this.setState({
      bookings: this.getNewBookingsForParking(),
    });
  }

  onClickLunch(lunchAvailable, id) {
    if (!lunchAvailable || id === 0) {
      return;
    }
    this.setState({
      bookings: this.getNewBookingsForLunch(id),
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

  renderHeader() {
    return (
      <View style={ApplicationStyles.headerView}>
        <TouchableOpacity
          style={ApplicationStyles.headerLeft}
          onPress={() => this.goBack()}>
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
            title={this.state.changeSeat ? 'Change Seat' : 'Book Reservation'}
          />
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
              <Text style={styles.modalNormalText}>Are you sure</Text>
              <Text style={styles.modalNormalText}>to book</Text>
              <Text style={styles.modalNormalText}>
                "
                {
                  <Text style={styles.modalSpeText}>
                    {this.reservation.Name}
                    {this.seat?.Name ? `, ${this.seat.Name}` : ''}
                  </Text>
                }
                "
              </Text>
              <Text style={styles.modalNormalText}>?</Text>
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
            {/* <CheckBox
              boxType={'circle'}
              disabled={!(v.IsAvailable ?? false) || isAndroid()}
              tintColors={
                v.IsAvailable ?? false
                  ? {true: Colors.primaryColor, false: Colors.primaryColor}
                  : {true: Colors.color1, false: Colors.color1}
              }
              style={styles.checkbox}
              value={
                this.state.bookings[this.state.currentIndex].lunchIds.indexOf(
                  v.id,
                ) !== -1
              }
            /> */}
            <CustomRadioBox
              disabled={true}
              isChecked={
                this.state.bookings[this.state.currentIndex].lunchIds.indexOf(
                  v.id,
                ) !== -1
              }
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

  renderContent = () => (
    <ScrollView
      style={styles.bottomSheetView}
      scrollEnabled={this.state.parentScrollEnabled}
      showsVerticalScrollIndicator={false}>
      <View style={styles.firstView}>
        {!this.state.changeSeat && (
          <View style={styles.rightView}>
            <Text style={styles.seats1Text}>Seats</Text>
            <Text
              style={
                styles.seats2Text
              }>{`${this.reservation.Reservations}/${this.reservation.Capacity}`}</Text>
          </View>
        )}
        <View style={styles.leftView}>
          <Text style={styles.leftText1}>
            {getLTime(this.state.bookings[this.state.currentIndex].date)}
          </Text>
          <Text style={styles.leftText2}>{this.reservation?.Name ?? ''}</Text>
          <Text style={styles.leftText3}>{this.reservation?.Note ?? ''}</Text>
        </View>
      </View>
      <View style={styles.borderView} />
      <ScrollView
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <ReactNativeZoomableView
          style={styles.locationView}
          // maximumZoomScale={Value.maximumZoomScale}
          // minimumZoomScale={Value.minimumZoomScale}
          // showsHorizontalScrollIndicator={false}
          // showsVerticalScrollIndicator={false}
          ref={(zoomableView) => {
            this.zoomableView = zoomableView;
          }}
          onZoomEnd={(event, gestureState, zoomableViewEventObject) => {
            if (zoomableViewEventObject.zoomLevel === 1.0) {
              this.setState({parentScrollEnabled: true});
            } else {
              this.setState({parentScrollEnabled: false});
            }
          }}
          bindToBorders={true}
          maxZoom={Value.maximumZoomScale}
          minZoom={Value.minimumZoomScale}
          zoomStep={0.5}
          initialZoom={1}>
          {this.state.base64 && (
            <Image
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
        </ReactNativeZoomableView>
        <MapZoomCancelButton
          isEnabled={!this.state.parentScrollEnabled}
          onPress={() => {
            this.zoomableView.setState({
              zoomLevel: 1.0,
              offsetX: 0,
              offsetY: 0,
            });
            this.setState({parentScrollEnabled: true});
          }}
        />
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
          value={this.state.bookings[this.state.currentIndex].parking}
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
      <View style={styles.lastView}>
        {this.state.currentIndex !== 0 && (
          <TouchableOpacity
            style={styles.book}
            onPress={() => this.handlePrevious()}>
            <Text style={styles.bookText}>Previous</Text>
          </TouchableOpacity>
        )}
        {this.state.currentIndex < this.state.bookings.length - 1 && (
          <TouchableOpacity
            style={styles.book}
            onPress={() => this.handleNext()}>
            <Text style={styles.bookText}>Next</Text>
          </TouchableOpacity>
        )}
        {this.state.currentIndex === this.state.bookings.length - 1 && (
          <TouchableOpacity
            style={styles.book}
            onPress={() => this.handleBooking()}>
            <Text style={styles.bookText}>
              {this.state.changeSeat ? 'Update' : 'Book'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  renderMyLocation = () =>
    this.state.bookings[this.state.currentIndex].XCoord >= 0 &&
    this.state.bookings[this.state.currentIndex].YCoord >= 0 && (
      <View
        style={[
          styles.markerContainerView,
          {
            left: myXCoordination(
              this.state.bookings[this.state.currentIndex].XCoord,
              this.state.imageWidth,
              this.state.imageHeight,
            ),
            top: myYCoordination(
              this.state.bookings[this.state.currentIndex].YCoord,
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
        {marker.Email !== this.props.user.Email && (
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
    updateMyReservation: () => {
      dispatch(userActions.updateMyReservation());
    },
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BookReservationScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Modal
  rootModal: {
    width: scale(300),
    // height: scale(360),
    borderRadius: Value.mainRadius,
    backgroundColor: 'white',
    paddingTop: scale(30),
    paddingBottom: scale(20),
  },
  modalNormalText: {
    ...ApplicationStyles.semiBoldFont,
    fontSize: textScale(21),
    color: Colors.color1,
    marginHorizontal: scale(16),
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
    marginTop: scaleVertical(8),
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
  },
  borderView: {
    backgroundColor: Colors.borderColor,
    height: 1,
    marginTop: scaleVertical(16),
  },

  mainView: {
    flex: 1,
  },
});
