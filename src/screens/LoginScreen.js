import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { LoginComponent, Background, ForgotPassModal } from "../components";
import { colors } from "../common/theme";
import * as firebase from "firebase";
import * as Facebook from "expo-facebook";
import { Button } from "react-native-elements";
import languageJSON from "../common/language";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      emailValid: true,
      passwordValid: true,
      showForgotModal: false,
      emailerror: null
    };
  }

  closeModal() {
    this.setState({ showForgotModal: false });
  }

  //go to register page
  onPressRegister() {
    this.props.navigation.navigate("Reg");
  }

  //forgot password press
  forgotPassPress() {
    this.setState({ showForgotModal: true });
  }

  onPressForgotPass(email) {
    var auth = firebase.auth();
    return auth
      .sendPasswordResetEmail(email)
      .then(res => {
        //console.log("A Password Reset Link sent to your email please check and reset your New Password")
        this.setState({ showForgotModal: false }, () => {
          setTimeout(() => {
            alert(languageJSON.forgot_password_success_messege);
          }, 600);
        });
      })
      .catch(error => {
        alert(error);
      });
  }

  //on press login after all validation
  async onPressLogin(email, password) {
    firebase
      .auth()
      //.signInWithEmailAndPassword(email, password)
      .signInWithEmailAndPassword("pedromartinez_goyo@hotmail.com", "123456")
      .then(res => {
        console.log('*****Login succedd!!');
      })
      .catch(res => {
        alert(res.message);
      });
  }

  async FbLogin() {
    try {
      await Facebook.initializeAsync("XXXXXXXXXXXXXXXXXX");
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ["public_profile", "email"]
      });
      if (type === "success") {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${token}`
        );
        const credential = firebase.auth.FacebookAuthProvider.credential(token);
        firebase
          .auth()
          .signInWithCredential(credential)
          .then(user => {
            console.log("user", user);
            if (user) {
              if (user.additionalUserInfo.isNewUser == true) {
                //console.log("user found");
                var data = user.additionalUserInfo;
                this.props.navigation.navigate("Reg", { requireData: data });
              } else {
                this.props.navigation.navigate("Root");
              }
            }
          })
          .catch(error => {
            console.log("error", error);
            alert(languageJSON.facebook_login_error);
          });
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(languageJSON.facebook_login_auth_error`${message}`);
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss()}>
        <Background>
          <View style={styles.logo}>
            <Image source={require("../../assets/images/logo.png")} />
          </View>
          <View style={styles.logInCompStyl} />
          <View style={styles.containerView}>
            <LoginComponent
              complexity={"any"}
              onPressRegister={() => {
                this.onPressRegister();
              }}
              onPressLogin={(email, password) =>
                this.onPressLogin(email, password)
              }
              onPressForgotPassword={() => {
                this.forgotPassPress();
              }}
            />
          </View>
          {/* <View style={styles.facebookButtonStyle}>
            <Button
              title={languageJSON.facebook_login_button}
              loading={false}
              titleStyle={styles.fbButtonTitleStyle}
              loadingProps={{ size: "large", color: colors.BLUE.default.primary }}
              buttonStyle={styles.fbLoginButtonStyle}
              containerStyle={styles.fbLoginButtonContainer}
              onPress={() => {
                this.FbLogin();
              }}
            />
          </View> */}

          <ForgotPassModal
            modalvisable={this.state.showForgotModal}
            requestmodalclose={() => {
              this.closeModal();
            }}
            inputEmail={this.state.email}
            emailerrorMsg={this.state.emailerror}
            onChangeTextInput={value => {
              this.setState({ emailerror: null, email: value });
            }}
            onPressForgotPass={email => this.onPressForgotPass(email)}
          />
        </Background>
      </TouchableWithoutFeedback>
    );
  }
}

//Screen Styling
const styles = StyleSheet.create({
  containerView: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: {
    flex: 1,
    position: "absolute",
    top: 80,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  logInCompStyl: {
    height: 135
  },
 /*  facebookButtonStyle: {
    flex: 0.2,
    alignItems: "center"
  }, */
  /* fbButtonTitleStyle: {
    fontSize: 16
  }, */
 /*  fbLoginButtonStyle: {
    backgroundColor: colors.SKY,
    height: 60,
    width: 180,
    borderRadius: 210 / 2
  },
  fbLoginButtonContainer: {
    flex: 1,
    elevation: 5,
    shadowColor: colors.BLACK,
    shadowRadius: 10,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 }
  } */
});
