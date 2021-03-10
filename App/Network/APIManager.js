import {base_url, router} from './URLProvider';
import apisauce from 'apisauce';
import {
  getBearToken,
  getDateForTeam,
  getUserName,
} from '../Utils/HelperService';
import {getSTime, getSTimeForPost} from '../Utils/extension';
import * as NavigationService from './..//Navigators/NavigationService';
import Constants from '../Config/Constants';

const api = apisauce.create({
  baseURL: base_url,
  headers: {
    // Accept: 'application/json',
    // 'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
  timeout: 30000,
});

function checkLoginStatus(res) {
  if (res.status === 401) {
    NavigationService.navigate('Login', {
      tokenExpired: true,
    });
  }
}

async function getProfile() {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(router.currentUser);
}

async function getColleague(searchString, date) {
  const query = {
    'request.query': searchString,
    'request.date': getSTime(date),
  };
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(router.colleague, query);
}

async function getMyReservation(searchString) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(router.reservations);
}

// TODO -> change endpoint
async function getMyLunch() {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(router.reservations);
}

async function getLocations(searchString) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(router.locations);
}

async function getFacilities() {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(router.facilities);
}

async function getAreas(locationId, startDate, endDate) {
  var query;
  if (startDate == null) {
    query = {
      'request.locationId': locationId,
    };
  } else {
    query = {
      'request.locationId': locationId,
      'request.startDate': getSTime(startDate),
      'request.endDate': getSTime(endDate),
    };
  }
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(router.areas, query);
}

async function getLunches(locationId, date) {
  const query = {
    fromDate: getSTime(date),
    toDate: getSTime(date),
    LocationId: locationId,
  };

  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get('/Reservations/PreBookingInfo', query);
}

async function getSeats(locationId) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(`/Admin/Areas/${locationId}/Seats`);
}

async function getReservationLocation(areaId, date = new Date()) {
  var query;
  query = {
    areaId: areaId,
    startDate: `${getSTime(date)}T00:00:00.000Z`,
    endDate: `${getSTime(date)}T23:59:59.999Z`,
  };
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(router.reservationLocations, query);
}

async function getImage(areaId) {
  const query = {v: getSTime(new Date())};
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(`${router.areas}/${areaId}${router.image}`, query);
  // return fetch(imageUrl, {
  //   method: 'GET',
  //   headers: {
  //     Authorization: bearerToken,
  //   },
  // });
}

async function checkInAtHome(dates) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  // const query = {date: getSTimeForPost(new Date())};
  // return api.post(`${router.reservations}/AtHome/CheckIn`, query);
  let query;
  if (dates == null) {
    query = {Dates: [getSTimeForPost(new Date())]};
  } else {
    query = {Dates: dates};
  }
  return api.post(`${router.reservations}/AtHome`, query);
}

async function checkInReservation(reservationId) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.put(`${router.reservations}/${reservationId}${router.checkIn}`);
}

async function checkInGuest(guestId) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.put(
    `${router.reservations}/${router.guests}/${guestId}${router.checkIn}`,
  );
}

async function deleteReservation(reservation) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  if (reservation.Area != null) {
    return api.delete(`${router.reservations}/${reservation.Id}`);
  } else {
    return api.delete(`${router.reservations}/AtHome/${reservation.Id}`);
  }
}

async function deleteGuest(guestId) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.delete(`${router.reservations}/${router.guests}/${guestId}`);
}

async function createReservation(body) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.post(router.reservations, body);
}

async function createGuest(body) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.post(`${router.reservations}/${router.guests}`, body);
}

async function updateReservation(reservationId, body) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.put(`${router.reservations}/${reservationId}`, body);
}

async function updateGuest(guestId, body) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.put(`${router.reservations}/${router.guests}/${guestId}`, body);
}

async function addTeamMember(ColleagueEmail) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.post(router.myTeam, {ColleagueEmail});
}

async function getTeamList() {
  // const query = {date: getSTime(new Date())};
  let date = await getDateForTeam();
  if (date == null) {
    date = getSTime(new Date());
  }
  const query = {date: date};
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.get(router.myTeam, query);
}

async function deleteTeamMember(id) {
  const bearerToken = await getBearToken();
  api.setHeader('Authorization', bearerToken);
  return api.delete(`${router.myTeam}/${id}`);
}

async function refreshToken() {
  const email = await getUserName();
  const newApi = apisauce.create({
    baseURL: 'https://login.microsoftonline.com/common/oauth2',
    headers: {
      // Accept: 'application/json',
      // 'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    timeout: 30000,
  });
  const query = {
    client_id: '8eb0134e-ee8f-4744-a3b3-6c01e2b5bb7c',
    response_type: 'token',
    redirect_uri: 'https%3A%2F%2Fportlr-bookings-test.azurewebsites.net%2F',
    scope: 'User.ReadBasic.All+User.Read',
    nonce: '12bfd3a1-e475-4a29-be6d-88358932c9be',
    state: 'abcd',
    login_hint: email,
  };
  return newApi.get('authorize', query);
}

function getRefreshTokenUrl() {
  const rad = '94c125e8-878d-4efe-a2bc-9051ccbcdc98';
  return `https://login.microsoftonline.com/common/oauth2/authorize?client_id=${Constants.credentials.client_id}&response_type=id_token&redirect_uri=https%3A%2F%2Fportlr-bookings-test.azurewebsites.net%2F&nonce=${rad}&state=${rad}`;
}

export const apiManager = {
  refreshToken,
  getRefreshTokenUrl,
  getProfile,
  getColleague,
  getMyReservation,
  getMyLunch,
  getLocations,
  getFacilities,
  getAreas,
  getImage,
  checkLoginStatus,
  checkInReservation,
  getReservationLocation,
  deleteReservation,
  createReservation,
  updateReservation,
  addTeamMember,
  getTeamList,
  deleteTeamMember,
  checkInAtHome,
  checkInGuest,
  deleteGuest,
  createGuest,
  updateGuest,
  getLunches,
  getSeats,
};
