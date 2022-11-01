import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, ActivityIndicator, Pressable, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { db, auth } from '../components/firebase';  // sama tiedosto kuin src/firebase/config.js
import firebase from 'firebase';
import { List, Divider, TextInput, FAB } from 'react-native-paper';
import { Icon } from 'react-native-elements';
import Styles from '../styles/styles';
import { render } from 'react-dom';


// https://blog.logrocket.com/storing-retrieving-data-react-native-apps-firebase/
// https://sebhastian.com/react-firestore/


class ViewAllExercisesScreen extends React.Component {

    // https://stackoverflow.com/questions/59599809/null-is-not-an-object-evaluating-firebase-auth-currentuser-email-firebas

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            exercises: [],
            user: '',
        };

        this.unsubscribe = null;
        this.navigation = this.props.navigation

    }

    componentDidMount() {

        this.setState({ loading: true })

        // if-lohkon avulla varmistetaan, että lenkkejä ei haeta ennen kuin
        // käyttäjä on määritelty eli kättely Firebasen kanssa on suoritettu
        if (auth.currentUser) {

            this.getExercises();

        }

    }

    // ryhmittely omaan metodiin, jotta tietokantayhteyden sammuttaminen saadaan
    // toimimaan
    // https://stackoverflow.com/questions/55905711/componentwillunmount-to-unsubscribe-from-firestore
    getExercises = () => {

        this.setState({ user: auth.currentUser.uid })

        const ref = db.collection('exercises')
            .where('belongsTo', '==', auth.currentUser.uid)
            .orderBy('createdAt', 'desc');

        const that = this;

        // palautusarvona metodi, jolla yhteys voidaan sammuttaa
        this.unsubscribe = ref.onSnapshot((query) => {
            const objs = [];

            query.forEach((entry) => {
                objs.push({
                    key: entry.id,
                    ...entry.data(),
                });
            });

            that.setState({ exercises: objs })
            that.setState({ loading: false })

            // return () => ref();
        })



        console.log('debug loading state ', this.state.loading)
        console.log('debug user state ', this.state.user ? this.state.user : null)
        console.log('debug currentUser ', auth.currentUser ? auth.currentUser.uid : null)
        console.log('debug exercises content ', this.state.exercises)

    }

    componentDidUpdate() {

        // console.log('did update')

    }

    // Warning: Can't perform a React state update on an unmounted component.
    //  This is a no-op, but it indicates a memory leak in your application.
    //   To fix, cancel all subscriptions and asynchronous tasks in the 
    //   componentWillUnmount method.

    // Varoitus "Can't perform a React state update on an unmounted component" korjattu
    // lisäämällä tähän auth.signOut()
    // https://stackoverflow.com/questions/61326204/how-do-i-unsubscribe-from-a-firestore-listener-in-react-native

    componentWillUnmount() {

        // tämä unsubscribe-metodi (ks. getExercises) sammuttaa tietokantayhteyden, kun
        //      komponentti suljetaan
        // ohittava if-lohko on tärkeä virheiden välttämiseksi, kun "unsubscribe" ei ole
        //      vielä määritelty
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        auth.signOut();

    }


    render() {

        if (this.state.loading === true) {
            return (
                <View>
                    <ActivityIndicator color='green' style={{ marginTop: 50 }} />
                    <Text style = {{ marginTop: 40, color: 'grey', alignSelf: 'center' }}>Haetaan lenkkejä...</Text>
                </View>
            )
        } else {

            return (

                <View style={Styles.containerExercisesView}>

                    <ScrollView style={{ marginTop: 5 }}>

                        <Divider style={{ marginBottom: 5, borderWidth: 0.5 }} />
                        {this.state.exercises.map((exerciseEntry) => (
                            <DBEntry key={exerciseEntry.key} obj={exerciseEntry} />
                        ))}
                        <StatusBar style="auto" />
                    </ScrollView>

                    <FAB
                        style={Styles.recordExerciseFAB}
                        icon='map-clock-outline'

                        onPress={() => this.props.navigation.navigate('recordExercise')}
                    />

                    <FAB
                        style={Styles.addExerciseFAB}
                        icon='plus'
                        // kun kyseessä React.Component, niin navigaatiota
                        // käytetään tähän tyyliin this.props.navigation
                        // se on tullut propsina sisään isäntäkomponentilta (Stack.Navigator)
                        // automaattisesti
                        onPress={() => this.props.navigation.navigate('addExercise')}
                    />

                </View>
            )
        }
    }

}


const DBEntry = ({ obj }) => {

    let uiSportType = '';
    switch (obj.sportType) {
        case "running":
            uiSportType = "Juoksu"
            break;
        case "walking":
            uiSportType = "Kävely"
            break;
        case "cycling":
            uiSportType = "Pyöräily"
            break;
        default:
            uiSportType = "Juoksu"
            break;
    }

    return (
        <View key={obj.key}>
            <Pressable onLongPress={() => handleDeleteExercise(obj)} >
                <Text style={Styles.dbEntrySubtitleStyle}>{obj.exerciseName}</Text>
                <Text style={Styles.dbEntryStyle}>{obj.exerciseLength} km</Text>
                {obj.exerciseDuration ? <Text style = {Styles.dbEntryStyle}>{obj.exerciseDuration}</Text> : null}
                <Text style={Styles.dbEntryStyle}>{uiSportType}</Text>
                <Text style={Styles.dbEntryStyle}>{obj.exerciseDate}</Text>
                <Divider style={{ marginBottom: 5, marginTop: 5, borderWidth: 0.5 }} />
            </Pressable>
        </View>
    )
}

const handleDeleteExercise = async (obj) => {
    const ref = db.collection('exercises').doc(obj.key);

    console.log('debug exerciseEntry ', obj)

    try {
        Alert.alert(
            'Oletko varma?',
            String("Haluatko poistaa lenkin '" + obj.exerciseName + "'?"),
            [
                {
                    text: 'Peruuta',
                    onPress: () => null,
                },
                {
                    text: 'Poista',
                    onPress: async () => await ref.delete(),
                }
            ],
        )
    } catch (err) {
        console.error(err);
    }
}


export default ViewAllExercisesScreen;