import React from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import 'react-native-gesture-handler';
import {store} from './Sagas/store';
import NavigatorProvider from './Navigators/mainNavigator';
import * as NavigationService from './Navigators/NavigationService';

export default class App extends React.Component {
  componentDidMount() {
    NavigationService.setNavigator(this.navigator);
  }

  renderApp = () => (
    <ReduxProvider store={store}>
      <NavigatorProvider
        style={[styles.flex]}
        ref={(nav) => {
          this.navigator = nav;
        }}
      />
    </ReduxProvider>
  );

  render = () => this.renderApp();
}

const styles = {flex: {flex: 1}};
