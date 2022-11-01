import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { db } from '../components/firebase';  // sama tiedosto kuin src/firebase/config.js
// import { auth } from '../components/firebase';
import Styles from '../styles/styles';


const LoggedInMainPage = () => {

    // sovelluksen tilaan asetettava lenkkilista, joka synkronoidaan Firebasen kanssa
    const [exercises, setExercises] = useState([]);

    // ylläpidetään yhteyttä firebase-tietokantaan
    useEffect(() => {
        let isMounted = true;

        const ref = db.collection('exercises');

        // onSnapshot muodostaa pitkäkestoisen yhteyden tietokantaan
        //    ja metodin sisältö ajetaan, kun tietokannan sisältö muuttuu
        ref.onSnapshot((query) => {
            if (isMounted) {
                const objs = [];
                query.forEach((doc) => {
                    objs.push({
                        key: doc.id,
                        ...doc.data(),
                    });
                });
                setExercises(objs);
            }

        });
        return () => {isMounted = false};
    }, [])
    // kakkosparametri [] voi säätää, mitä arvoja listassa on oltava 

    return (
        <View style={Styles.container}>
            {exercises.map((obj) => (
                <DBEntry key={obj.key} obj={obj} />
            ))}
            <StatusBar style="auto" />
        </View>
    )
};

const DBEntry = ({ obj }) => {

    return (
        <View>
            <Text style={Styles.regularText}>{obj.exerciseName}</Text>
            <Text style={Styles.regularText}>{obj.exerciseDate.toDate().toDateString()}</Text>
            <Text style={Styles.regularText}>{obj.exerciseLength}</Text>
            <Text></Text>
        </View>
    )
}

export default LoggedInMainPage;
