import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

export const _storeData = async (userToken) => {
  try {
    await AsyncStorage.setItem('userToken', userToken);
  } catch (error) {
    // Error saving data
  }
};

export const _storeTodayCheckStatus = async (data) => {
  try {
    await AsyncStorage.setItem(
      moment().format('yyyy-MM-DD'),
      JSON.stringify(data),
    );
  } catch (error) {
    // Error saving data
  }
};

export function getTodayCheckStatus() {
  return AsyncStorage.getItem(moment().format('yyyy-MM-DD'));
}

export function getToken() {
  return AsyncStorage.getItem('userToken');
}

export async function getBearToken() {
  const token = await getToken();
  return `Bearer ${token}`;
}

export function getDateForTeam() {
  return AsyncStorage.getItem('dateForTeam');
}

export const _storeTimeForTeam = async (date) => {
  try {
    await AsyncStorage.setItem('dateForTeam', date);
  } catch (error) {
    // Error saving data
  }
};

export const _storeName = async (userName) => {
  try {
    await AsyncStorage.setItem('userName', userName);
  } catch (error) {
    // Error saving data
  }
};

export async function getUserName() {
  return await AsyncStorage.getItem('userName');
}

export const _storeLocation = async (location) => {
  try {
    await AsyncStorage.setItem('currentLocation', JSON.stringify(location));
  } catch (error) {
    // Error saving data
  }
};

export function getCurrentLocation() {
  return AsyncStorage.getItem('currentLocation');
}

export function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return [d.getUTCFullYear(), weekNo];
}

export function getDateRangeOfWeek(w, y) {
  return [1, 2, 3, 4, 5, 6, 7].map((d) => moment(`${y}-${w}-${d}`, 'YYYY-W-E'));
}
