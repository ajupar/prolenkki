
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { db } from '../components/firebase';  // sama tiedosto kuin src/firebase/config.js
import { List, Divider, TextInput, FAB } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';
import ViewAllExercisesScreen from './ViewAllExercisesScreen';
import AddExerciseScreen from './AddExerciseScreen';
import RecordExerciseScreen from './RecordExerciseScreen';
import Styles from '../styles/styles';
import ForFade from '../components/ForFade';

const Stack = createStackNavigator();

// edelleen StackNavigator, jonka sisällä joko näytetään lenkit tai lisätään lenkki
const ExercisesTab = () => {

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
                    name='viewAll'
                    component={ViewAllExercisesScreen}
                    options={{
                        title: 'Lenkit',
                        cardStyleInterpolator: ForFade,
                        headerTintColor: '#fff'
                    }}
                />
                <Stack.Screen 
                    name = 'addExercise'
                    component = {AddExerciseScreen}
                    options = {{
                        title: 'Lisää lenkki',
                        cardStyleInterpolator: ForFade,
                        headerTintColor: '#fff',
                    }}
                />
                <Stack.Screen
                    name = 'recordExercise'
                    component = {RecordExerciseScreen}
                    options = {{
                        title: 'Lenkin nauhoitus',
                        cardStyleInterpolator: ForFade,
                        headerTintColor: '#fff',
                    }}
                />
            </Stack.Navigator>
        </>
    )
}

export default ExercisesTab;