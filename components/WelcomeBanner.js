import React, {Component} from 'react';

import { StyleSheet, View, Text} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default class WelcomeBanner extends Component{
    render(){
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Welcome Back {this.props.NAME}!</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignContent: 'center',
        width: '80%',
        alignSelf: 'center',
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
        bottom: 10
    },
    header:{
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    bodyText:{
        marginTop: 5,
        textAlign: 'center'
    },
    gradient: {
        flex: 1,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: -1,
      },
});
