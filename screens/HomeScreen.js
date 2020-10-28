import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Button, ImageBackground } from 'react-native';
import { AuthContext } from '../AuthContext.js';

import TipOTD from '../components/TipOTD';
import WelcomeBanner from '../components/WelcomeBanner';
import albumImage from '../assets/images/album-placeholder.png';

export default function HomeScreen(props) {
  const user = React.useContext(AuthContext);

  const TOTD = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam pulvinar pellentesque ex at maximus. Nam feugiat rhoncus accumsan. ';
  return (
    <ScrollView style={styles.container}>
      <ImageBackground style={ styles.imgBackground }  
        source={require('../assets/images/mountain.png')}>
        <WelcomeBanner name={user.firstName}></WelcomeBanner>
      </ImageBackground>
      
      <Text style={styles.header}>Recently Played</Text>
      <View style={styles.recentTab}>
        <Image source={albumImage} style={styles.albumImages}></Image>
        <Image source={albumImage} style={styles.albumImages}></Image>
        <Image source={albumImage} style={styles.albumImages}></Image>
      </View>
      <Text style={styles.header}>Recently Liked</Text>
      <View style={styles.recentTab}>
        <Image source={albumImage} style={styles.albumImages}></Image>
        <Image source={albumImage} style={styles.albumImages}></Image>
        <Image source={albumImage} style={styles.albumImages}></Image>
      </View>
      <Text style={styles.text2}>Need to adjust your assessment?</Text>
      <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate('InitialAssessment')}>
        <Text style={styles.text}>Retake Assessment</Text>
      </TouchableOpacity>
      <TipOTD TOTD={TOTD}></TipOTD>
        
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00095e',
    flex: 1
  },
  header:{
    padding: 15,
    fontFamily: 'Poppins-Light',
    fontSize: 20,
    color: 'white'
  },
  imgBackground: {
    width: '100%',
    height: '20%',
  },
  
  recentTab:{
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  albumImages: {
    borderRadius: 8,
    width: 100,
    height: 100,
  },
  buttonContainer:{
    margin: 10,
    padding: 10
  },
  button:{
    marginBottom: 20,
    backgroundColor: '#132090',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8
  },
  text: {
    color: 'white',
    fontSize: 16,   
    fontFamily: 'Poppins-Medium'
  },
  text2: {
    textAlign: 'center',
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    marginTop: 50,
    marginBottom: 5,
  }

  
});
