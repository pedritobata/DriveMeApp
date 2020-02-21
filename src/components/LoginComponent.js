import React, { Component } from "react";
import { StyleSheet, View, Dimensions, LayoutAnimation } from "react-native";
import { Input, Button } from "react-native-elements";
import { colors } from "../common/theme";
import { loginPage } from "../common/key";
var { width } = Dimensions.get("window");
import languageJSON from "../common/language";

export default class LoginComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      emailValid: true,
      passwordValid: true,
      pwdErrorMsg: ""
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
  onPressLogin() {
    const { onPressLogin } = this.props;
    LayoutAnimation.easeInEaseOut();
    const emailValid = this.validateEmail();
    const passwordValid = this.validatePassword();

    if (emailValid && passwordValid) {
      //login function of smart component
      onPressLogin(this.state.email, this.state.password);
      this.setState({ email: "", password: "" });
    }
  }

  render() {
    const { onPressRegister, onPressForgotPassword } = this.props;

    return (
      <View style={styles.mainContainer}>
        <View style={styles.inputContainer}>
          <Input
            ref={input => (this.emailInput = input)}
            editable={true}
            underlineColorAndroid={colors.TRANSPARENT}
            placeholder={languageJSON.email_placeholder}
            placeholderTextColor={colors.Smoke_Grey}
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
            ref={input => (this.passwordInput = input)}
            editable={true}
            blurOnSubmit={true}
            underlineColorAndroid={colors.TRANSPARENT}
            placeholder={languageJSON.password_placeholder}
            placeholderTextColor={colors.Smoke_Grey}
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
            inputContainerStyle={styles.pwdInputContainerStyle}
            containerStyle={styles.pwdInputContainer}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            clear
            title={languageJSON.register_link}
            loading={false}
            loadingProps={{ size: "large", color: colors.BLUE.default.primary }}
            titleStyle={styles.forgotTitleStyle}
            onPress={onPressRegister}
            buttonStyle={styles.buttonStyle}
            containerStyle={{ flex: 1 }}
          />
          {/* <View style={styles.verticalLineStyle} /> */}
          <Button
            clear
            title={languageJSON.forgot_password_link}
            loading={false}
            onPress={onPressForgotPassword}
            loadingProps={{ size: "large", color: colors.BLUE.default.primary }}
            titleStyle={styles.forgotTitleStyle}
            titleProps={{ numberOfLines: 2, ellipsizeMode: "tail" }}
            buttonStyle={styles.buttonStyle}
            containerStyle={{ flex: 1 }}
          />
        </View>
        <View style={styles.loginButton}>
          <Button
            title={languageJSON.login_button}
            loading={false}
            loadingProps={{ size: "large", color: colors.BLUE.default.primary }}
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
      alignItems: 'center'
  },
  inputContainer: {
    flex: 0.5,
    width: "100%",
    alignItems: "center",
    elevation: 20,
    justifyContent: "flex-end",
    shadowColor: colors.BLACK,
    shadowRadius: 10,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 10,
    //padding: 30
  },
  buttonContainer: {
    flex: 0.2,
    flexDirection: "row",
    marginRight: 15,
    justifyContent: 'space-between'
  },
  loginButtonContainer: {
    //flex: 1,
    elevation: 0,
    shadowColor: colors.BLACK,
    shadowRadius: 10,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 }
  },
  loginButtonStyle: {
    backgroundColor: colors.SKY,
    height: 45,
    borderRadius: 5
    //borderBottomLeftRadius: 5
  },
  loginButton: {
    flex: 0.2,
    width: "70%"
  },
  buttonStyle: {
    backgroundColor: colors.BLUE.default.secondary,
    height: 45
  },
  emailInputContainer: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingLeft: 15,
    backgroundColor: colors.WHITE,
    paddingRight: 15,
    paddingTop: 10,
    width: width - 60
  },
  pwdInputContainer: {
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 15,
    backgroundColor: colors.WHITE,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 40,
    borderBottomColor: colors.BLACK,
    //borderBottomWidth: 0,
    width: width - 60
  },
  emailInputContainerStyle: {
    borderBottomColor: colors.SKY,
    borderBottomWidth: 1,
    paddingBottom: 15
  },
  pwdInputContainerStyle: {
    paddingBottom: 15,
    borderBottomColor: colors.SKY,
    borderBottomWidth: 1,
  },
  errorMessageStyle: {
    fontSize: 13,
    //fontWeight: "bold",
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
  buttonTitleStyle: {
    fontWeight: "700",
    width: "100%"
  },
  forgotTitleStyle: {
    fontWeight: "700",
    fontSize: 12,
    width: "100%"
  },
  buttonContainerStyle: {
    flex: 1
  }
});
