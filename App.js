import React from 'react';
import { AppLoading } from 'expo';
import {Asset} from 'expo-asset';
import * as Font from 'expo-font';
import AppContainer from './src/navigation/AppNavigator';

//Database import
import * as firebase from 'firebase'

var firebaseConfig = {
  apiKey: "AIzaSyBwIFAFdg7-DIDZo-lPTwGYbCKLAf88Vtg",
  authDomain: "drivemeapp-e0d7b.firebaseapp.com",
  databaseURL: "https://drivemeapp-e0d7b.firebaseio.com",
  projectId: "drivemeapp-e0d7b",
  storageBucket: "drivemeapp-e0d7b.appspot.com",
  messagingSenderId: "439369249573",
  appId: "1:439369249573:web:dca53e746bd1f2eee560cc",
  measurementId: "G-5H4G3PN216"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {

  state = {
    assetsLoaded: false,
  };

  constructor(){
    super();
    console.disableYellowBox = true;
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/background.png'),
        require('./assets/images/logo.png'),
      ]),
      Font.loadAsync({
        'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
        'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
        'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
        'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
        
      }),
    ]);
  };

 
  render() {
    return (
        this.state.assetsLoaded ?    
          <AppContainer/>  
          :         
          <AppLoading
            startAsync={this._loadResourcesAsync}
            onFinish={() => this.setState({ assetsLoaded: true })}
            onError={console.warn}
            autoHideSplash={true}
          />
    );
  }
}