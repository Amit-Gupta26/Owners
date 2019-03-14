/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import { StyleSheet, View} from 'react-native';
import MapView from 'react-native-maps';
import Search from './extras/Search';
import Geocoder from 'react-native-geocoder';
import firebase from 'react-native-firebase';

export default class App extends Component {

  componentDidMount(){
    firebase.analytics().setCurrentScreen("Home");
    firebase.analytics().setUserProperty("userType", "developer");
    var NY = {
      lat: 40.7809261,
      lng: -73.9637594
    };
    
    Geocoder.geocodePosition(NY).then(res => {
      let code = res[0].adminArea;
      alert(code);
        // res is an Array of geocoding object (see below)
    })
    .catch(err => console.warn(err))
    firebase.analytics().logEvent("buttonPressed");
    firebase.analytics().logEvent("Beds", "2+");
  }
  render() {
    return (
    <View style={styles.container}>
     <Search/>
   </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
