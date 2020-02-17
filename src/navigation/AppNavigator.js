import { createSwitchNavigator,createAppContainer } from 'react-navigation';
import { AuthStack, RootNavigator, DriverRootNavigator, } from './MainNavigator';
import { AuthLoadingScreen } from '../screens/AuthLoadingScreen';

const AppNavigator= createSwitchNavigator({
        AuthLoading: AuthLoadingScreen,
        Auth: AuthStack,
        Root: RootNavigator,
        //DriverRoot: DriverRootNavigator
        },
        {
            initialRouteName: 'AuthLoading'
        }
    );
    const AppContainer = createAppContainer(AppNavigator);
    export default AppContainer;
  