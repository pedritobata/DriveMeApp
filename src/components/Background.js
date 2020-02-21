import React from "react";
import { StyleSheet, ImageBackground, View } from "react-native";
//import { colors } from "react-native-elements";
import { colors } from "../common/theme";

export default class Background extends React.Component {
  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={
          !this.props.noBackImage
            ? require("../../assets/images/back-image.jpg")
            : null
        }
      >
        <View style={!this.props.noBackImage ? styles.container: null}>{this.props.children}</View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  imgBackground: {
    width: "100%",
    height: "100%"
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0, 0.6)'
  }
});
