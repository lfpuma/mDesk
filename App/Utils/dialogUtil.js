import {Alert} from 'react-native';

function showAlert(title, msg) {
  Alert.alert(title, msg);
}

function showWarning(msg) {
  Alert.alert('Warning', msg);
}

function showError(msg) {
  Alert.alert('Error', msg);
}

function showSuccess(msg) {
  Alert.alert('Success', msg);
}

function showNotice(title, msg, handler) {
  Alert.alert(title, msg, [
    {
      text: 'OK',
      onPress: () => {
        handler();
      },
    },
  ]);
}

export const dialogUtil = {
  showWarning,
  showAlert,
  showNotice,
  showError,
  showSuccess,
};
