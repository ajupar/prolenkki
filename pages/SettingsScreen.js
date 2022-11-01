import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import { auth } from '../components/firebase'
import Styles from '../styles/styles';

const handleLogout = () => {
    auth.signOut();
}

const handleRemoveAccount = () => {
    
    // https://stackoverflow.com/questions/41665902/how-do-i-style-an-alert-element-in-react-native
    Alert.alert('Oletko varma?', String("Haluatko poistaa käyttäjätilin '" + auth.currentUser.email + "' pysyvästi?"),
        [
            {
                text: 'Peruuta',
                onPress: () => null
            },
            {
                text: 'Poista tili',
                onPress: async () => await auth.currentUser.delete()
            }
        ]);
}

const SettingsScreen = ({ navigation }) => {
    return (
        <View>

        <Text style = {{ marginBottom: 15, marginLeft: 10, marginRight: 10, marginTop: 20, fontSize: 14}}>Käyttäjätunnus: {auth.currentUser.email}</Text>

            <TouchableOpacity
                style={Styles.removeAccountButton}
                onPress={() => handleRemoveAccount()}>
                <Text style={Styles.buttonText}>Poista käyttäjätili</Text>
            </TouchableOpacity>

            {/* <Text style={{ paddingTop: 40, fontSize: 24, fontWeight: 'bold', color: 'green' }}>Asetukset</Text> */}
            <TouchableOpacity
                style={Styles.logoutButton}
                onPress={() => handleLogout()}>
                <Text style={Styles.buttonText}>Kirjaudu ulos</Text>
            </TouchableOpacity>
        </View>
    )
}

export default SettingsScreen;