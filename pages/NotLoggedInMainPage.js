import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { db } from '../components/firebase';  // sama tiedosto kuin src/firebase/config.js
import { auth } from '../components/firebase';


const NotLoggedInMainPage = () => {

    return (
        <View>
            <Text style = {{ marginTop: 40 }}>Not logged in</Text>
        </View>
    )

};

export default NotLoggedInMainPage;