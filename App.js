import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { LogBox, Text, SafeAreaView, View } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { db } from './components/firebase';  // sama tiedosto kuin src/firebase/config.js
import { auth } from './components/firebase';
import LoggedInMainPage from './pages/LoggedInMainPage';
import NotLoggedInMainPage from './pages/NotLoggedInMainPage';
import ExercisesTab from './pages/ExercisesTab';
import SettingsTab from './pages/SettingsTab';

import LogInScreen from './pages/LogInScreen';
import RegisterScreen from './pages/RegisterScreen';
import Styles from './styles/styles';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomNavigator, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';

import ForFade from './components/ForFade';

// https://medium.com/swlh/lets-create-mobile-app-with-react-native-and-firebase-6967a7946408#d78b
// https://www.freecodecamp.org/news/react-native-firebase-tutorial/
// https://rnfirebase.io/

const Stack = createStackNavigator();  // navigointi kirjautumisen/rekisteröitymisen välillä
const Tab = createBottomTabNavigator();  // navigointi kirjatuneena





export default function App() {

  //  LogBox.ignoreLogs(["Setting a timer for a long period of time", "Can't perform a React state update on an unmounted component"]);
  LogBox.ignoreLogs(["Setting a timer for a long period of time", "Remote debugger"]);
  // "Can't perform a React state update on an unmounted component"

  // Onko käyttäjä kirjautunut Firebaseen omilla tunnuksilla
  const [loggedIn, setLoggedIn] = useState(false);

  // Kysytään sijainnin käyttölupa jo tässä, niin uutta käyttäjää ei heitetä ulos,
  //    kun käyttää karttaa ensimmäisen kerran
  Location.requestForegroundPermissionsAsync();

  // if (status !== 'granted') {
  //   console.log('location permission not granted')

  //   alert('Location permission not granted');
  // }

  // tarkistetaan kirjautumistila
  auth.onAuthStateChanged((user) => {
    if (user) {
      setLoggedIn(true);

    } else {
      setLoggedIn(false);
    }
  });


  // sovelluksen renderöitävä sisältö
  return (
    <NavigationContainer theme={DefaultTheme} >

      {loggedIn ? (

        <SafeAreaView style={{ flex: 1, backgroundColor: '#29434e' }}>
          <Tab.Navigator
            initialRouteName='exercises'
            screenOptions={({ route }) => ({
              initialRouteName: 'exercises',  // ILMEISESTI TÄMÄ TOIMII. lisätään, jotta oletuksena aina ladataan lenkkinäkymä
              tabBarIcon: ({ color, size }) => {
                if (route.name === 'exercises') {
                  return (
                    <FontAwesome
                      name='list-ul'
                      size={size}
                      color={color}
                    />
                  )
                }
                if (route.name === 'settings') {
                  return (
                    <FontAwesome
                      name="cogs"
                      size={size}
                      color={color}
                    />
                  )
                }
              },
            })}
            tabBarOptions={{
              initialRouteName: 'exercises',  // ILMEISESTI TÄMÄ TOIMII. lisätään, jotta oletuksena aina ladataan lenkkinäkymä
              activeTintColor: 'white',
              inactiveTintColor: '#819ca9',
              style: {
                backgroundColor: 'green'
              }
            }}
          >
            <Tab.Screen
              name="exercises"
              component={ExercisesTab}
              options={{
                title: 'Lenkit',
                initialRouteName: 'exercises'
              }}
            />
            <Tab.Screen
              name="settings"
              component={SettingsTab}
              options={{
                title: 'Käyttäjätili'
              }}
            />
          </Tab.Navigator>
        </SafeAreaView>

      ) : (
        <>
          <StatusBar style="light" />
          <Stack.Navigator
            mode="card"
            screenOptions={{

            }}
          >
            <Stack.Screen
              name="logIn"
              component={LogInScreen}
              options={{
                title: 'Pro Lenkki - Kirjaudu',
                cardStyleInterpolator: ForFade,
                headerStyle: {
                  backgroundColor: 'green',
                  borderBottomColor: 'green',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name='register'
              component={RegisterScreen}
              options={{
                title: 'Pro Lenkki - Luo tili',
                cardStyleInterpolator: ForFade,
                headerStyle: {
                  backgroundColor: 'green',
                  borderBottomColor: 'green',
                },
                headerTintColor: '#fff',
              }}
            />
          </Stack.Navigator>
        </>
      )}
    </NavigationContainer>
  );
}
