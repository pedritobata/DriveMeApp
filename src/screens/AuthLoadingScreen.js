import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Platform
} from 'react-native';

import * as firebase from 'firebase'
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import GetPushToken from '../common/GetPushToken';
export class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  bootstrapAsync =  () => {
    firebase.auth().onAuthStateChanged((user)=>{
      if(user && user.displayName){
        const userData = firebase.database().ref('users/'+user.uid);
        userData.on('value',userData=>{
          if(userData.val() && userData.val().usertype == 'rider'){
                      this.props.navigation.navigate('Root'); 
                      GetPushToken();
                     }
                     else{ 
                      this.props.navigation.navigate('Auth');
                     }
        })
      }else{
              this.props.navigation.navigate('Auth');
            }
    })

  };


  componentDidMount(){
    
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }
  _handleNotification = (notification) => {
    //console.log(notification)
    alert(notification.data.msg)
   };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.IndicatorStyle}>
        <ActivityIndicator  size="large" />
      </View>
    );
  }
}

//Screen Styling
const styles = StyleSheet.create({
  IndicatorStyle:{
    flex:1, 
    justifyContent:"center"
  }
})