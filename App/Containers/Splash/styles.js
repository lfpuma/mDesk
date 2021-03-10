import {StyleSheet} from 'react-native';
import ApplicationStyles from './../../Utils/ApplicationStyles';
import {scale} from './../../Utils/scale';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: scale(200),
    height: 200,
  },
  ...ApplicationStyles,
});
