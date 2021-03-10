import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createDrawerNavigator} from 'react-navigation-drawer';
import DrawerScreen from '../Containers/Drawer/DrawerScreen';
import SplashScreen from '../Containers/Splash';
import HomeScreen from '../Containers/Home/HomeScreen';
import LoginScreen from '../Containers/Auth/LoginScreen';
import {scale} from '../Utils/scale';
import MyReservationScreen from '../Containers/MyReservation/MyReservationScreen';
import GuestsScreen from '../Containers/MyReservation/GuestsScreen';
import MakeReservationScreen from '../Containers/MyReservation/MakeReservationScreen';
import BookReservationScreen from '../Containers/MyReservation/BookReservationScreen';
import QuickCheckScreen from '../Containers/QuickCheckIn/QuickCheckScreen';
import CheckInOfficeScreen from '../Containers/CheckIn/CheckInOfficeScreen';
import SettingsScreen from '../Containers/Settings/SettingsScreen';
import 'react-native-gesture-handler';
import MyTeamScreen from '../Containers/MyTeams/MyTeamScreen';
import AddGuestScreen from '../Containers/MyReservation/AddGuestScreen';
import MyLunchScreen from '../Containers/Lunch/MyLunchScreen';
import FirstMakeLunchScreen from '../Containers/Lunch/FirstMakeLunchScreen';
import SecondMakeLunchScreen from '../Containers/Lunch/SecondMakeLunchScreen';
import FinalMakeLunchScreen from '../Containers/Lunch/FinalMakeLunchScreen';
import LunchDetailScreen from '../Containers/Lunch/LunchDetailScreen';
import NewCheckinScreen from '../Containers/CheckIn/NewCheckinScreen';

const LunchStack = createStackNavigator(
  {
    MyLunch: {
      screen: MyLunchScreen,
      navigationOptions: {
        header: null,
      },
    },
    FirstMakeLunch: {
      screen: FirstMakeLunchScreen,
      navigationOptions: {
        header: null,
      },
    },
    SecondMakeLunch: {
      screen: SecondMakeLunchScreen,
      navigationOptions: {
        header: null,
      },
    },
    FinalMakeLunch: {
      screen: FinalMakeLunchScreen,
      navigationOptions: {
        header: null,
      },
    },
    LunchDetail: {
      screen: LunchDetailScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'MyLunch',
  },
);

const ReservationStack = createStackNavigator(
  {
    MyReservation: {
      screen: MyReservationScreen,
      navigationOptions: {
        header: null,
      },
    },
    Guests: {
      screen: GuestsScreen,
      navigationOptions: {
        header: null,
      },
    },
    AddGuest: {
      screen: AddGuestScreen,
      navigationOptions: {
        header: null,
      },
    },
    MakeReservation: {
      screen: MakeReservationScreen,
      navigationOptions: {
        header: null,
      },
    },
    BookReservation: {
      screen: BookReservationScreen,
      navigationOptions: {
        header: null,
      },
    },
    ChangeSeat: {
      screen: BookReservationScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'MyReservation',
  },
);

const MakeReservationStack = createStackNavigator(
  {
    MakeReservations: {
      screen: MakeReservationScreen,
      navigationOptions: {
        header: null,
      },
    },
    BookReservation: {
      screen: BookReservationScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'MakeReservations',
  },
);

const MyTeamStack = createStackNavigator(
  {
    MyTeamS: {
      screen: MyTeamScreen,
      navigationOptions: {
        header: null,
      },
    },
    BookReservationWithTeam: {
      screen: BookReservationScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'MyTeamS',
  },
);

const HomeStack = createStackNavigator(
  {
    HomeS: {
      screen: HomeScreen,
      navigationOptions: {
        header: null,
      },
    },
    BookReservationWithHome: {
      screen: BookReservationScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'HomeS',
  },
);

const CheckInStack = createStackNavigator(
  {
    CheckIn: {
      screen: NewCheckinScreen,
      navigationOptions: {
        header: null,
      },
    },
    CheckInOffice: {
      screen: CheckInOfficeScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'CheckIn',
  },
);

const MainNavigator = {
  Home: {
    screen: HomeStack,
    navigationOptions: {
      header: null,
    },
  },
  ReservationStack: {
    screen: ReservationStack,
    navigationOptions: {
      header: null,
    },
  },
  LunchStack: {
    screen: LunchStack,
    navigationOptions: {
      header: null,
    },
  },
  MakeReservationsStack: {
    screen: MakeReservationStack,
    navigationOptions: {
      header: null,
    },
  },
  QuickCheck: {
    screen: QuickCheckScreen,
    navigationOptions: {
      header: null,
    },
  },
  CheckInStack: {
    screen: CheckInStack,
    navigationOptions: {
      header: null,
    },
  },
  MyTeam: {
    screen: MyTeamStack,
    navigationOptions: {
      header: null,
    },
  },
  Settings: {
    screen: SettingsScreen,
    navigationOptions: {
      header: null,
    },
  },
};

const DrawerAppNavigator = createDrawerNavigator(
  {
    ...MainNavigator,
  },
  {
    initialRouteName: 'Home',
    contentComponent: DrawerScreen,
    drawerWidth: scale(250),
  },
);

const AppNavigator = createSwitchNavigator(
  {
    SplashScreen: {
      screen: SplashScreen,
    },
    Login: {
      screen: LoginScreen,
    },
    Drawer: {
      screen: DrawerAppNavigator,
    },
  },
  {
    initialRouteName: 'SplashScreen',
  },
);

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
