import React, { Component } from "react";
import { StyleSheet, View, Dimensions, LayoutAnimation } from "react-native";
import { Input, Button } from "react-native-elements";
import { colors } from "../common/theme";
import { loginPage } from "../common/key";
const { width, height } = Dimensions.get("window");
import languageJSON from "../common/language";

export default class LoginComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      emailValid: true,
      passwordValid: true,
      pwdErrorMsg: "",
      loadingButton: false
    };
  }

  //validation for email
  validateEmail() {
    const { email } = this.state;
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailValid = re.test(email);
    LayoutAnimation.easeInEaseOut();
    this.setState({ emailValid: true });
    emailValid || this.emailInput.shake();
    return true; //emailValid;
  }

  //validation for password
  validatePassword() {
    const { complexity } = this.props;
    const { password } = this.state;
    const regx1 = /^([a-zA-Z0-9@*#]{8,15})$/;
    const regx2 = /(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/;
    if (complexity == "any") {
      var passwordValid = password.length >= 1;
      this.setState({ pwdErrorMsg: languageJSON.password_blank_messege });
    } else if (complexity == "alphanumeric") {
      var passwordValid = regx1.test(password);
      this.setState({ pwdErrorMsg: languageJSON.password_alphaNumeric_check });
    } else if (complexity == "complex") {
      var passwordValid = regx2.test(password);
      this.setState({ pwdErrorMsg: languageJSON.password_complexity_check });
    }
    LayoutAnimation.easeInEaseOut();
    this.setState({ passwordValid: true });
    passwordValid || this.passwordInput.shake();
    return true; //passwordValid;
  }

  //login press for validation check
  async onPressLogin() {
    const { onPressLogin } = this.props;
    LayoutAnimation.easeInEaseOut();
    const emailValid = this.validateEmail();
    const passwordValid = this.validatePassword();

    if (emailValid && passwordValid) {
      //login function of smart component
      await onPressLogin(this.state.email, this.state.password);
      this.setState({loadingButton: true});
      this.setState({ email: "", password: "" });
    }
  }

  render() {
    const { onPressRegister, onPressForgotPassword } = this.props;

    return (
      <View style={styles.mainContainer}>
        <View style={styles.inputContainer}>
          <Input
            label="Email"
            labelStyle={styles.labelInput}
            ref={input => (this.emailInput = input)}
            editable={true}
            underlineColorAndroid={colors.TRANSPARENT}
            //placeholder={languageJSON.email_placeholder}
            //placeholderTextColor={colors.Smoke_Grey}
            value={this.state.email}
            keyboardType={"email-address"}
            inputStyle={styles.inputTextStyle}
            onChangeText={text => {
              this.setState({ email: text });
            }}
            errorMessage={
              this.state.emailValid ? null : languageJSON.valid_email_check
            }
            secureTextEntry={false}
            blurOnSubmit={true}
            onSubmitEditing={() => {
              this.validateEmail();
              this.passwordInput.focus();
            }}
            errorStyle={styles.errorMessageStyle}
            inputContainerStyle={styles.emailInputContainerStyle}
            containerStyle={styles.emailInputContainer}
          />
          <Input
            label="Password"
            labelStyle={styles.labelInput}
            ref={input => (this.passwordInput = input)}
            editable={true}
            blurOnSubmit={true}
            underlineColorAndroid={colors.TRANSPARENT}
            //placeholder={languageJSON.password_placeholder}
            //placeholderTextColor={colors.Smoke_Grey}
            value={this.state.password}
            inputStyle={styles.inputTextStyle}
            onChangeText={text => {
              this.setState({ password: text });
            }}
            errorMessage={
              this.state.passwordValid ? null : this.state.pwdErrorMsg
            }
            secureTextEntry={true}
            onSubmitEditing={() => {
              this.validatePassword();
            }}
            errorStyle={styles.errorMessageStyle}
            inputContainerStyle={styles.emailInputContainerStyle}
            containerStyle={styles.emailInputContainer}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            clear
            title={languageJSON.register_link}
            loading={false}
            loadingProps={{ size: "large", color: colors.BLUE.default.primary }}
            titleStyle={{...styles.forgotTitleStyle, textAlign: 'left'}}
            onPress={onPressRegister}
            buttonStyle={styles.buttonStyle}
            containerStyle={{ flex: 0.5}}
          />
          {/* <View style={styles.verticalLineStyle} /> */}
          <Button
            clear
            title={languageJSON.forgot_password_link}
            loading={false}
            onPress={onPressForgotPassword}
            loadingProps={{ size: "large", color: colors.BLUE.default.primary }}
            titleStyle={{...styles.forgotTitleStyle, textAlign: 'right'}}
            titleProps={{ numberOfLines: 2, ellipsizeMode: "tail" }}
            buttonStyle={styles.buttonStyle}
            containerStyle={{ flex: 1}}
          />
        </View>
        <View style={styles.loginButton}>
          <Button
            title={languageJSON.login_button}
            loading={this.state.loadingButton}
            loadingStyle={{ width: "100%", paddingTop:10}}
            loadingProps={{ size: "large", color: colors.WHITE }}
            titleStyle={styles.buttonTitleStyle}
            onPress={() => {
              this.onPressLogin();
            }}
            buttonStyle={styles.loginButtonStyle}
            containerStyle={styles.loginButtonContainer}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'stretch'
  },
  inputContainer: {
    flex: 0.5,
    //alignItems: "stretch",
    elevation: 20,
    justifyContent: "space-around",
    //backgroundColor: colors.WHITE,
    //width: 100,
   /*  shadowColor: colors.BLACK,
    shadowRadius: 10,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 }, */
   // marginBottom: 10,
    //padding: 30
  },
  buttonContainer: {
    flex: 0.2,
    flexDirection: "row",
    //marginRight: 15,
    //justifyContent: 'space-around'
  },
  loginButtonContainer: {
    //flex: 1,
    elevation: 0,
    shadowColor: colors.BLACK,
    shadowRadius: 10,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 6,
    paddingHorizontal: 5
  },
  loginButtonStyle: {
    backgroundColor: colors.SKY,
    height: height / 13,
    borderRadius: 5
    //borderBottomLeftRadius: 5
  },
  loginButton: {
    flex: 0.2,
    width: "80%"
  },
  buttonStyle: {
    backgroundColor: colors.BLUE.default.secondary,
    height: 45
  },
  buttonTitleStyle: {
    fontWeight: "700",
    fontSize: width / 21,
    width: "100%"
  },
  labelInput: {
    position: "absolute", 
    top: -8, left: 20, 
    zIndex: 10, 
    backgroundColor: 'rgba(0,0,0, .75)',
    shadowColor: colors.BLACK,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.6,
    fontSize: 14,
    color: colors.WHITE,
    paddingHorizontal: 5
  },
  emailInputContainer: {
   /*  borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingLeft: 15,
    backgroundColor: colors.WHITE,
    paddingRight: 15,
    paddingTop: 10, */
    //width: "100%"
    //marginVertical: width / 30,
    //flex: 0.3,
    borderRadius: 5,

  },
  //pwdInputContainer: {
   /*  borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 15,
    backgroundColor: colors.WHITE,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 40,
    borderBottomColor: colors.BLACK, */
    //borderBottomWidth: 0,
    //width: "100%"
 // },
  emailInputContainerStyle: {
   /*  borderBottomColor: colors.SKY,
    borderBottomWidth: 1,
    paddingBottom: 15 */
    borderWidth: 2,
    borderColor: colors.WHITE,
    padding: height / 64,
    
  },
 /*  pwdInputContainerStyle: {
    paddingBottom: 15,
    borderBottomColor: colors.SKY,
    borderBottomWidth: 1,
    borderWidth: 1,
  }, */
  errorMessageStyle: {
    fontSize: 13,
    color: "#FD2323"
  },
  inputTextStyle: {
    color: colors.BLACK,
    fontSize: 14
  },
  verticalLineStyle: {
    height: 25,
    width: 2,
    top: 12,
    backgroundColor: colors.WHITE
  },
 
  forgotTitleStyle: {
    fontWeight: "700",
    fontSize: width / 25,
    width: "100%",
  },
  buttonContainerStyle: {
    flex: 1
  }
});
