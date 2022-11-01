import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import { auth } from '../components/firebase'
import Styles from '../styles/styles';
import SettingsScreen from './SettingsScreen';

// muista kutsua createStackNavigatoria funktiona!!!
// eli createStackNavigator() sulkumerkkien kanssa
const Stack = createStackNavigator();

const SettingsTab = () => {

    return (

        <>
            <StatusBar style='light' />
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: 'green'
                    }
                }}
            >

                <Stack.Screen
                    name='settings'
                    component={ SettingsScreen } 
                    options={{
                        title: 'Käyttäjätili',
                        headerTintColor: '#fff'
                    }}
                />

            </Stack.Navigator>

        </>
    )

}

export default SettingsTab;